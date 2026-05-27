import React, { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/src/components/ui/sheet";
import { useUrlDoc } from "@/src/api/storage/useStorage";
import { Download } from "lucide-react";

export default function UniversalMediaView({ document, isOpen, onClose }) {

    const { cleanPath, pageNumber } = useMemo(() => {
        if (!document) return { cleanPath: "", pageNumber: null };
        const [path, pageHash] = document.split("#page=");
        return {
            cleanPath: path,
            pageNumber: pageHash ? parseInt(pageHash, 10) : null
        };
    }, [document]);

    const mediaType = useMemo(() => {
        if (!cleanPath) return 'unknown'; // Khi state bị clear, nó rơi vào 'unknown'

        const pureExtension = cleanPath.split('.').pop().toLowerCase().split('?')[0].split('#')[0];

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'jfif'].includes(pureExtension)) {
            return 'image';
        }
        if (pureExtension === 'pdf') {
            return 'pdf';
        }

        return 'unknown';
    }, [cleanPath]);

    const firefoxSafePath = useMemo(() => {
        if (!cleanPath) return "";
        return cleanPath
            .split('/')
            .map(segment => encodeURIComponent(segment))
            .join('/');
    }, [cleanPath]);

    const { url: signedUrl, isLoading, isError } = useUrlDoc(isOpen ? firefoxSafePath : "");

    const finalIframeUrl = useMemo(() => {
        if (!signedUrl || mediaType === "image") return signedUrl || "";
        return pageNumber ? `${signedUrl}#page=${pageNumber}` : signedUrl;
    }, [signedUrl, pageNumber, mediaType]);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-4xl p-0 flex flex-col h-full gap-0 border-l border-zinc-200 dark:border-zinc-800">
                <SheetHeader className="sr-only">
                    <SheetTitle>Document Viewer</SheetTitle>
                </SheetHeader>

                <div className="flex-1 w-full h-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">

                    {/* TRẠNG THÁI 1: ĐANG TẢI */}
                    {isLoading && (
                        <div className="flex flex-col h-full items-center justify-center text-sm text-zinc-500 gap-2">
                            <div className="w-6 h-6 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                            Đang tải tài liệu...
                        </div>
                    )}

                    {/* TRẠNG THÁI 2: LỖI */}
                    {!isLoading && (isError || !signedUrl) && (
                        <div className="flex flex-col h-full items-center justify-center text-sm text-zinc-500 gap-2 px-6 text-center">
                            <p className="font-medium text-zinc-700 dark:text-zinc-300">Không thể mở tài liệu này.</p>
                            <p className="text-xs text-zinc-400 break-all max-w-md">Đường dẫn: {cleanPath}</p>
                        </div>
                    )}

                    {/* TRẠNG THÁI 3: HIỂN THỊ THÀNH CÔNG */}
                    {!isLoading && signedUrl && (
                        <div className="w-full h-full relative group flex items-center justify-center">

                            {/* NẾU CHẮC CHẮN LÀ ẢNH */}
                            {mediaType === 'image' && (
                                <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                                    <img
                                        src={signedUrl}
                                        alt="Document preview"
                                        className="max-w-full max-h-full object-contain shadow-sm rounded-md"
                                    />
                                </div>
                            )}

                            {/* NẾU CHẮC CHẮN LÀ PDF */}
                            {mediaType === 'pdf' && (
                                <object
                                    data={finalIframeUrl}
                                    type="application/pdf"
                                    className="w-full h-full border-0 bg-white"
                                >
                                    <div className="flex flex-col h-full items-center justify-center text-sm text-zinc-500">
                                        <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp.</p>
                                        <a href={signedUrl} download className="text-blue-500 hover:underline mt-2">
                                            Nhấn vào đây để tải tài liệu
                                        </a>
                                    </div>
                                </object>
                            )}

                            {/* TRẠNG THÁI BẢO VỆ: Khi đang đóng (document = null) hoặc file không xác định */}
                            {mediaType === 'unknown' && (
                                <div className="w-full h-full bg-transparent" />
                            )}

                            {/* Nút tải/Mở tab mới */}
                            <a
                                href={signedUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute top-4 right-8 bg-black/60 hover:bg-black text-white p-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                title="Mở sang tab mới"
                            >
                                <Download className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
