import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import { useCourseActions } from "@/src/api/courses/useCoures"
import { ComboboxBasic } from "../Review/simpleForm"
import { useRef, useState } from "react"
import { UploadCloud, X, FileText } from "lucide-react"
import { toast } from "sonner"
import { useDocumentActions } from "@/src/api/documents/useDocuments"
import { timeLog } from "console"

export default function UploadDocumentView() {
    const [chosenCourse, setChosenCourse] = useState("")
    const [chosenUni, setChosenUni] = useState("")
    const [title, setTitle] = useState("");
    const { handleCreate: createDoc } = useDocumentActions()

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFiles = (newFiles: File[]) => {
        const updatedFiles = [...selectedFiles];

        newFiles.forEach((file) => {
            let fileName = file.name;
            let nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
            let ext = fileName.substring(fileName.lastIndexOf('.'));

            if (fileName.lastIndexOf('.') === -1) {
                nameWithoutExt = fileName;
                ext = "";
            }

            let counter = 1;
            let uniqueName = fileName;

            while (updatedFiles.some((f) => f.name === uniqueName)) {
                uniqueName = `${nameWithoutExt}(${counter})${ext}`;
                counter++;
            }

            const renamedFile = new File([file], uniqueName, { type: file.type });

            if (file.size === 0 && !file.type) {
                toast.error("Folder not allowed!", {
                    icon: "🎉",
                })
            } else {
                updatedFiles.push(renamedFile);
            }
        });

        setSelectedFiles(updatedFiles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.items) {
            let hasFolder = false;
            const validFiles: File[] = [];

            for (let i = 0; i < e.dataTransfer.items.length; i++) {
                const item = e.dataTransfer.items[i];
                if (item.kind === 'file') {
                    const entry = item.webkitGetAsEntry();
                    if (entry && entry.isDirectory) {
                        hasFolder = true;
                    } else {
                        const file = item.getAsFile();
                        if (file) validFiles.push(file);
                    }
                }
            }

            if (hasFolder) {
                toast.error("Folder not allowed!", { icon: "🎉" });
            }

            if (validFiles.length > 0) {
                processFiles(validFiles);
            }
        }
    };

    const format_category = (chosenCourse?: string, chosenUni?: string) => {
        if (chosenCourse && chosenUni) {
            return `${chosenUni} - ${chosenCourse}`
        } else if (chosenUni) {
            return chosenUni
        }
        else if (chosenCourse) {
            return chosenCourse
        }
        return undefined
    }
    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Vui lòng nhập tiêu đề!");
            return;
        }
        try {
            const payload = {
                item_in: JSON.stringify({
                    title: title,
                    category: format_category(chosenCourse, chosenUni)
                }),
                files: selectedFiles
            };

            await createDoc(payload as any);
            toast.success("Upload thành công!");
        } catch (error) {
            toast.error("Có lỗi xảy ra khi tạo document.");
        }

    };
    const removeFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const { Courses = [] } = useCourseActions({ limit: 9999 })
    const courses: string[] = Courses.map((prof) => prof.name);
    const courseName = Array.from(new Set(courses))
    const uniName = ["HUS", "USSH", "ULIS", "UET", "UEB", "UED", "VJU", "UMP", "UL"]

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full button-primary flex items-center justify-center py-6">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="font-semibold">New Document</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-yellow-400 p-4 font-bold text-center shrink-0">
                    UPLOAD DOCUMENT
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <h3 className="font-bold border-b pb-2">DOCUMENT INFO</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold">TIÊU ĐỀ</label>
                            <input className="w-full border p-2 mt-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                placeholder="Title"
                                onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative z-50">
                                <label className="text-xs font-semibold">MÔN HỌC</label>
                                <ComboboxBasic
                                    placeholder="Tìm môn học"
                                    frameworks={courseName}
                                    onSelectValue={(value) => setChosenCourse(value)}
                                />
                            </div>
                            <div className="relative z-50">
                                <label className="text-xs font-semibold">TRƯỜNG</label>
                                <ComboboxBasic
                                    placeholder="Chọn trường"
                                    frameworks={uniName}
                                    onSelectValue={(value) => setChosenUni(value)}
                                />
                            </div>
                        </div>

                        {/* SECTION UPLOAD FILE */}
                        <div className="border-t pt-4 space-y-2">
                            <h3 className="font-bold mb-2">FILES & SECTIONS</h3>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileChange}
                                multiple
                            />

                            {/* Hiển thị danh sách file */}
                            {selectedFiles.length > 0 && (
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between border p-2 rounded-sm bg-zinc-50">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                                <span className="text-sm font-medium truncate" title={file.name}>{file.name}</span>
                                            </div>
                                            <button
                                                onClick={() => removeFile(index)}
                                                className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                                                type="button"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Vùng DROPZONE */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed p-4 text-center text-sm cursor-pointer transition-colors rounded-sm mt-2
                                    ${isDragging
                                        ? "border-yellow-500 bg-yellow-50 text-yellow-600"
                                        : "border-zinc-300 text-zinc-400 hover:border-yellow-400 hover:bg-yellow-50"
                                    }`}
                            >
                                <UploadCloud className="mx-auto h-6 w-6 mb-1 text-zinc-300" />
                                <p>{isDragging ? "Thả file vào đây..." : "Nhấp hoặc kéo thả file vào đây..."}</p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 shrink-0 bg-white">
                    <Button className="w-full bg-black text-white py-6 hover:bg-zinc-800 transition-all font-bold" onClick={handleSubmit}>
                        SUBMIT DOCUMENT
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
