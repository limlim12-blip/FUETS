from abc import ABC, abstractmethod
import boto3
import httpx
from src.core.config import config
from typing import List, Optional, Dict, Any, Tuple


class IStorageRepo(ABC):
    @abstractmethod
    def get_file_bytes(self, key: str) -> bytes:
        pass

    @abstractmethod
    def list_files(self, prefix: str) -> List[str]:
        pass

    @abstractmethod
    def delete_prefix(self, prefix: str) -> None:
        pass

    @abstractmethod
    def get_presigned_url(self, key: str) -> str:
        pass

    @abstractmethod
    def get_usage_metrics(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def upload_file(
        self,
        key: str,
        content: bytes,
        content_type: str,
        metadata: Optional[Dict[str, str]] = None,
    ) -> None:
        pass


class R2StorageRepo(IStorageRepo):
    def __init__(self):
        self.bucket = "docs"
        self.s3 = boto3.client(
            service_name="s3",
            endpoint_url=config.R2_URL,
            aws_access_key_id=config.R2_ACCESS_KEY,
            aws_secret_access_key=config.R2_SECRET_KEY,
            region_name="auto",
        )

    def get_file_bytes(self, key: str) -> bytes:
        resp = self.s3.get_object(
            Bucket=self.bucket,
            Key=key,
        )
        return resp["Body"].read()

    def list_files(self, prefix: str) -> List[str]:
        resp = self.s3.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
        return [
            obj["Key"]
            for obj in resp.get("Contents", [])
            if not obj["Key"].endswith("/")
        ]

    def delete_prefix(self, prefix: str) -> None:
        files = self.list_files(prefix)
        for key in files:
            self.s3.delete_object(Bucket=self.bucket, Key=key)

    def get_presigned_url(self, key: str) -> str:
        return self.s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self.bucket,
                "Key": key,
                "ResponseContentDisposition": "inline",
                "ResponseContentType": "application/pdf",
            },
            ExpiresIn=3600,
        )

    def get_usage_metrics(self) -> Dict[str, Any]:
        url = f"https://api.cloudflare.com/client/v4/accounts/{config.R2_ACCOUNT_ID}/r2/buckets/{self.bucket}/usage"
        headers = {"Authorization": f"Bearer {config.R2_TOKEN}"}

        with httpx.Client() as client:
            response = client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            if not data.get("success"):
                raise ValueError("Cloudflare API returned an error payload.")
            return data

    def upload_file(
        self,
        key: str,
        content: bytes,
        content_type: str,
        metadata: Optional[Dict[str, str]] = None,
    ) -> None:
        self.s3.put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
            Metadata=metadata or {},
        )
