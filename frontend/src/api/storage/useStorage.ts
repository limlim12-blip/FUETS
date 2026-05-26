import { toast } from "sonner";
import {
    useGetBucketUsageApiV1R2StorageUsageGet,
    useGetDocumentFileUrlApiV1R2StorageFilePathUrlGet,
    downloadFileApiV1R2StorageDownloadFilepathGet,
} from "./storage";
import { useState } from "react";

export const useStorageActions = (prefix: string = "/documents") => {

    // const { data, isLoading, isError, refetch, isFetching } = useListFilesApiV1R2StorageListFilesPrefixGet(prefix);

    const BucketUsage = useGetBucketUsageApiV1R2StorageUsageGet();
    const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({});
    //NOTE: orval default to json if not json orval sucks
    const handleDownload = async (filename: string) => {

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
            toast.success("Download FILE SUCCESFULLY!!", {
                description: "!!!!!!!!!!!!!!!!!!!!!!",
                icon: "🎉",
            })

        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Download FILE FAILED SUCCESFULLY!!", {
                description: "???????????????????",
                icon: "🎉",
            })

        }
    };


    return {

        handleDownload,
        BucketUsage,

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
                // IMPORTANT: Prevent the query from running if the filepath is empty
                enabled: Boolean(filepath),
                // Optional: keep the old data while fetching a new one to prevent flickering
                placeholderData: (prev) => prev,
            }
        }
    );

    return {
        // Extract the actual URL string from your FastAPI response {"url": "..."}
        url: query.data?.url || "",
        isLoading: query.isLoading,
        isError: query.isError
    };
};
