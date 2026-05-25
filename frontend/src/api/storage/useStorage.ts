import { toast } from "sonner";
import {
    useGetBucketUsageApiV1R2StorageUsageGet,
    useListFilesApiV1R2StorageListFilesPrefixGet,
    downloadFileApiV1R2StorageDownloadFilenameGet,
} from "./storage";
import { useState } from "react";

export const useStorageActions = (prefix: string = "/documents") => {

    // const { data, isLoading, isError, refetch, isFetching } = useListFilesApiV1R2StorageListFilesPrefixGet(prefix);

    const BucketUsage = useGetBucketUsageApiV1R2StorageUsageGet();
    const [downloadingStates, setDownloadingStates] = useState<Record<string, boolean>>({});
    //NOTE: orval default to json if not json orval sucks
    const handleDownload = async (filename: string) => {

        try {
            const response = await downloadFileApiV1R2StorageDownloadFilenameGet(filename) as any;

            let blob: Blob;

            if (response instanceof Blob) {
                blob = response;
            } else if (response.data instanceof Blob) {
                blob = response.data;
            } else {
                blob = new Blob([response.data || response], { type: 'application/pdf' });
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.split('/').pop() || 'file.pdf';
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
