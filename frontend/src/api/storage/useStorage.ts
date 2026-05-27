import { toast } from "sonner";
import {
    useGetBucketUsageApiV1R2StorageUsageGet,
    useGetDocumentFileUrlApiV1R2StorageFilePathUrlGet,
    downloadFileApiV1R2StorageDownloadFilepathGet,
} from "./storage";
import { useState, useCallback } from "react";

export const useStorageActions = (prefix: string = "/documents") => {

    // const { data, isLoading, isError, refetch, isFetching } = useListFilesApiV1R2StorageListFilesPrefixGet(prefix);

    const BucketUsage = useGetBucketUsageApiV1R2StorageUsageGet();
    const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({});
    //NOTE: orval default to json if not json orval sucks
    const handleDownload = useCallback(async (filename: string) => {
        setDownloadingStates((prev) => ({ ...prev, [filename]: true }));

        try {
            const response = await downloadFileApiV1R2StorageDownloadFilepathGet(filename, {
                responseType: 'blob'
            }) as any;

            let blob: Blob;

            if (response instanceof Blob) {
                blob = response;
            } else if (response?.data instanceof Blob) {
                blob = response.data;
            } else {
                const dataToBuffer = response?.data !== undefined ? response.data : response;
                const contentType = response?.headers?.['content-type'] || 'application/octet-stream';
                blob = new Blob([dataToBuffer], { type: contentType });
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.split('/').pop() || 'file';

            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Download SUCCESSFUL!", {
                description: "The file has been saved to your device.",
                icon: "🎉",
            });

        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Download FAILED!", {
                description: "There was a problem downloading the file.",
                icon: "❌",
            });
        } finally {
            setDownloadingStates((prev) => ({ ...prev, [filename]: false }));
        }
    }, []);
    const handleLoadFile = useCallback(async (filename: string) => {
        try {
            const response = await downloadFileApiV1R2StorageDownloadFilepathGet(filename, {
                responseType: 'blob'
            }) as any;

            let blob: Blob;

            if (response instanceof Blob) {
                blob = response;
            } else if (response?.data instanceof Blob) {
                blob = response.data;
            } else {
                const dataToBuffer = response?.data !== undefined ? response.data : response;
                const contentType = response?.headers?.['content-type'] || 'application/octet-stream';
                blob = new Blob([dataToBuffer], { type: contentType });
            }

            return blob;
        } catch (error) {
            console.error("Load File failed:", error);
            return null;
        }
    }, []);

    return {

        handleDownload,
        BucketUsage,
        handleLoadFile,

        // handleCreate,
        // handleUpdate,

        downloadingStates
    };
};
export const useUrlDoc = (filepath: string) => {
    const query = useGetDocumentFileUrlApiV1R2StorageFilePathUrlGet(
        filepath,
        {
            query: {
                enabled: Boolean(filepath),
                placeholderData: (prev: any) => prev,
            }
        }
    );

    const extractedUrl = query.data?.url || query.data?.data?.url || "";

    return {
        url: extractedUrl,
        isLoading: query.isLoading,
        isError: query.isError
    };
};
