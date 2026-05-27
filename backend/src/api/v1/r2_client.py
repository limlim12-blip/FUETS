from concurrent.futures import process
import io
import zipfile
import boto3
import httpx
import requests
from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import StreamingResponse
from src.core.config import config
from src.api.deps import CurrentUser, SessionDep, get_current_user
from urllib.parse import quote
from botocore.config import Config

router = APIRouter(prefix="/r2_storage", dependencies=[])
BUCKET_NAME = "docs"


def get_s3_client():
    s3 = boto3.client(
        service_name="s3",
        endpoint_url=config.R2_URL,
        aws_access_key_id=config.R2_ACCESS_KEY,
        aws_secret_access_key=config.R2_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )
    return s3


@router.get(
    "/download/{filepath:path}",
    # why? idk
    responses={
        200: {
            "content": {"application/octet-stream": {}},
            "description": "Returns the requested file or folder zip archive.",
        }
    },
)
async def download_file(filepath: str, s3=Depends(get_s3_client)):
    base_name = filepath.split("/")[-1]
    encoded_filename = quote(base_name)

    file_list = get_all_objects_under_prefix(s3, filepath)
    print("dbu:", encoded_filename, file_list)
    try:
        if len(file_list) == 1 and file_list[0] == filepath:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=filepath)
            file_content = response["Body"].read()
            return Response(
                content=file_content,
                media_type=response.get("ContentType", "application/octet-stream"),
                headers={
                    "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
                },
            )
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                for file_key in file_list:
                    if file_key.endswith("/"):
                        continue
                    response = s3.get_object(Bucket=BUCKET_NAME, Key=file_key)
                    zip_file.writestr(file_key.split("/")[-1], response["Body"].read())
            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={
                    "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}.zip"
                },
            )

    except s3.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_all_objects_under_prefix(s3_client, prefix: str) -> list[str]:
    response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)
    if "Contents" in response:
        return [
            obj["Key"] for obj in response["Contents"] if not obj["Key"].endswith("/")
        ]
    return []


@router.get("/list-files/{prefix:path}")
async def list_files(prefix: str, s3=Depends(get_s3_client)):
    return get_all_objects_under_prefix(s3, quote(prefix))


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
async def get_bucket_usage():
    url = f"https://api.cloudflare.com/client/v4/accounts/{config.R2_ACCOUNT_ID}/r2/buckets/docs/usage"
    headers = {"Authorization": f"Bearer {config.R2_TOKEN}"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            if not data.get("success"):
                raise HTTPException(status_code=500, detail="Cloudflare API error")

            return data
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, detail="Cloudflare API unreachable"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/{file_path:path}/url")
async def get_document_file_url(
    *,
    s3=Depends(get_s3_client),
    file_path: str,
):

    try:
        presigned_url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": "docs",
                "Key": file_path,
                "ResponseContentDisposition": "inline",
            },
            ExpiresIn=3600,
        )
        return {"url": presigned_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
