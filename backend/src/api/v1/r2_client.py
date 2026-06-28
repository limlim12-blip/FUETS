import io
import zipfile
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse
from src.repo.obj_store import IStorageRepo
from urllib.parse import quote
from slowapi.util import get_remote_address
from slowapi import Limiter
from fastapi import (
    Request,
)
from fastapi import Request, Depends
from src.api.deps import StorageDep

router = APIRouter(prefix="/r2_storage", dependencies=[])
limiter = Limiter(
    key_func=get_remote_address, strategy="fixed-window", storage_uri="memory://"
)


@router.get(
    "/download/{filepath:path}",
    responses={  # why? idk
        200: {
            "content": {"application/octet-stream": {}},
            "description": "Returns the requested file or folder zip archive.",
        }
    },
)
@limiter.limit("2/second", per_method=True)
@limiter.limit("10/minute", per_method=True)
@limiter.limit("30/day", per_method=True)
async def download_file(
    filepath: str,
    request: Request,
    repo: IStorageRepo = StorageDep,
):
    base_name = filepath.split("/")[-1]
    encoded_filename = quote(base_name)

    try:
        file_list = repo.list_files(filepath)
        if len(file_list) == 1 and file_list[0] == filepath:
            file_content = repo.get_file_bytes(filepath)
            return Response(
                content=file_content,
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
                },
            )
        if not file_list:
            raise HTTPException(status_code=404, detail="File or directory not found")

        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for file_key in file_list:
                file_bytes = repo.get_file_bytes(file_key)
                zip_filename = file_key.split("/")[-1]
                zip_file.writestr(zip_filename, file_bytes)

        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}.zip"
            },
        )

    except KeyError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        if "NoSuchKey" in str(type(e)):
            raise HTTPException(status_code=404, detail="File not found")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list-files/{prefix:path}")
async def list_files(prefix: str, repo: IStorageRepo = StorageDep):
    return repo.list_files(quote(prefix))


""" 
    EXAMPLE RESPONSE:
        {'success': True, 'errors': [], 'messages': [],
         'result': {'end': '2026-05-20T14:20:00.000Z',
                    'payloadSize': '1659795523', 'metadataSize': '356360',
                    'objectCount': '1307', 'uploadCount': '0',
                    'infrequentAccessPayloadSize': '0', 'infrequentAccessMetadataSize': '0', 
                    'infrequentAccessObjectCount': '0', 'infrequentAccessUploadCount': '0'}}
    """


@router.get("/usage")
async def get_bucket_usage(repo: IStorageRepo = StorageDep):
    try:
        return repo.get_usage_metrics()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Cloudflare API unreachable")


@router.get("/{file_path:path}/url")
async def get_document_file_url(file_path: str, repo: IStorageRepo = StorageDep):
    try:
        url = repo.get_presigned_url(file_path)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{key:path}")
async def delete_obj(key: str, repo: IStorageRepo = StorageDep):
    try:
        repo.delete_prefix(f"documents/{key}")
        return {"success": True, "message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
