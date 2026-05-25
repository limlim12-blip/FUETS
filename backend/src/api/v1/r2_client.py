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

router = APIRouter(prefix="/r2_storage", dependencies=[])
BUCKET_NAME = "docs"


def get_s3_client():
    s3 = boto3.client(
        service_name="s3",
        endpoint_url=config.R2_URL,
        aws_access_key_id=config.R2_ACCESS_KEY,
        aws_secret_access_key=config.R2_SECRET_KEY,
        region_name="auto",
    )
    return s3


@router.get("/download/{filepath:path}")
async def download_file(filepath: str, s3=Depends(get_s3_client)):
    base_name = filepath.split("/")[-1]
    encoded_filename = quote(base_name)

    file_list = get_all_objects_under_prefix(s3, filepath)
    try:
        if not file_list:
            print(file_list)
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
            for file in file_list:
                with zipfile.ZipFile(
                    zip_buffer, "a", zipfile.ZIP_DEFLATED, False
                ) as zip_file:
                    response = s3.get_object(Bucket=BUCKET_NAME, Key=file)
                    zip_file.writestr(file.split("/")[-1], response["Body"].read())
            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={
                    "Content-Disposition": f"attachment; filename={encoded_filename}.zip"
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
    return get_all_objects_under_prefix(s3, prefix)


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
