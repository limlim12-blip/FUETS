import React, { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
// Import your new custom hook
import { useUrlDoc } from "@/src/api/storage/useStorage";

export default function PdfView({ document, isOpen, onClose }) {
    // 1. Tách đường dẫn thô và số trang
    console.log(document)
    const { rawPath, pageNumber } = useMemo(() => {
        if (!document) return { rawPath: "", pageNumber: null };
        const [path, pageHash] = document.split("#page=");
        return {
            rawPath: path,
            pageNumber: pageHash ? parseInt(pageHash, 10) : null
        };
    }, [document]);

    // 2. Chuẩn hóa URL an toàn
    const safePath = useMemo(() => {
        if (!rawPath) return "";
        try {
            return encodeURI(decodeURI(rawPath));
        } catch {
            return encodeURI(rawPath);
        }
    }, [rawPath]);

    // 3. ✅ GỌI HOOK Ở TOP LEVEL
    // Truyền safePath vào, hook sẽ tự động gọi API khi safePath thay đổi
    const { url: signedUrl, isLoading } = useUrlDoc(safePath);
    console.log("url", signedUrl)


    // 4. Đóng gói URL cuối cùng cho Iframe
    const finalIframeUrl = useMemo(() => {
        if (!signedUrl) return "";
        return pageNumber ? `${signedUrl}#page=${pageNumber}` : signedUrl;
    }, [signedUrl, pageNumber]);

    const isImage = useMemo(() => /\.(jpg|jpeg|png|gif|webp)$/i.test(rawPath), [rawPath]);
    console.log(finalIframeUrl)


    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col h-full gap-0 border-l border-zinc-200 dark:border-zinc-800">
                <SheetHeader className="sr-only">
                    <SheetTitle>Document Viewer</SheetTitle>
                </SheetHeader>

                <div className="flex-1 w-full h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
                    {isLoading ? (
                        <div className="flex flex-col h-full items-center justify-center text-sm text-zinc-500">
                            Đang tải tài liệu...
                        </div>
                    ) : !signedUrl ? (
                        <div className="flex flex-col h-full items-center justify-center text-sm text-zinc-500">
                            Không tìm thấy tài liệu.
                        </div>
                    ) : isImage ? (
                        <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
                            <img src={signedUrl} alt="Document" className="max-w-full h-auto" />
                        </div>
                    ) : (
                        <iframe src={finalIframeUrl} className="w-full h-full border-0" title="PDF" />
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
