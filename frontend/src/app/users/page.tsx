"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserActions } from "@/src/api/user/useUser";
import { useUserStore } from "@/src/stores/userStore";
import { PasswordInput } from "@/src/components/ui/password-input";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import SettingsPopover from "@/src/components/SettingsPopover";
import {
    MoreHorizontal,
    User,
    ShieldCheck,
    Trash2,
    SquareDashedKanban,
    FileText,
    AngryIcon,
    ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/src/components/ui/dialog";

export default function AdminUsersPage() {
    const { role } = useUserStore();
    const router = useRouter();

    // FIX: Gộp 2 lần gọi useUserActions thành 1 lần duy nhất để tối ưu hiệu năng
    const {
        data: currentUserData,
        users,
        userLoading: isLoading,
        handleDelete,
        handleUpdate,
        usersFetch
    } = useUserActions();

    const currentUserName = currentUserData?.email ? currentUserData.email.split("@")[0] : "Admin";

    // State dành cho việc chỉnh sửa thông tin người dùng
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [updateEmail, setUpdateEmail] = useState("");
    const [updatePassword, setUpdatePassword] = useState("");

    useEffect(() => {
        if (!isLoading && role !== 'admin') {
            router.push('/');
        }
    }, [role, isLoading, router]);

    const onDeleteUser = async (id: string, email: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${email}?`)) {
            try {
                handleDelete(id);
                toast.success("Xóa người dùng thành công!");
            } catch (error) {
                toast.error("Xóa người dùng thất bại.");
            }
        }
    };

    const onToggleAdmin = async (user: any) => {
        try {
            await handleUpdate(user.id, {
                is_superuser: !user.is_superuser
            });
            toast.success(user.is_superuser ? "Đã hủy quyền Admin!" : "Đã cấp quyền Admin thành công!");
            usersFetch();
        } catch (error) {
            toast.error("Thay đổi quyền hạn thất bại.");
        }
    };

    const openUpdateModal = (user: any) => {
        setSelectedUser(user);
        setUpdateEmail(user.email || "");
        setUpdatePassword("");
        setIsUpdateModalOpen(true);
    };

    const onConfirmUpdateInfo = async () => {
        if (!updateEmail.trim()) {
            toast.error("Email không được để trống!");
            return;
        }
        try {
            // Chỉ gửi password nếu admin có nhập mới vào ô input
            const updatePayload: any = { email: updateEmail };
            if (updatePassword.trim()) {
                updatePayload.password = updatePassword;
            }

            await handleUpdate(selectedUser.id, updatePayload);
            toast.success("Cập nhật thông tin thành công");
            setIsUpdateModalOpen(false);
            usersFetch();
        } catch (error) {
            toast.error("Cập nhật thất bại");
        }
    };

    if (isLoading) return <div className="p-10 text-center text-zinc-500 animate-pulse">Check Permission...</div>;
    if (role !== 'admin') return null;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 lg:px-12 py-4 shadow-sm shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/doc"
                            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
                        >
                            <span>Docs</span>
                            <FileText className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/review"
                            className="flex items-center gap-2.5 rounded-full bg-gradient-to-b from-white to-zinc-50 px-5 py-2 text-sm font-semibold text-zinc-900 border border-zinc-200/80 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.08)] transition-all hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:from-zinc-900 dark:to-zinc-950 dark:text-white dark:border-zinc-800"
                        >
                            Reviews
                            <SquareDashedKanban className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                        </Link>

                        <Link
                            href="/chat"
                            className="flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-2 text-xs font-semibold shadow-md transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95"
                        >
                            <AngryIcon className="h-4 w-4" />
                            <span>Chat</span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <SettingsPopover>
                            <button className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <div className="flex items-center gap-3 rounded-xl p-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900 uppercase">
                                        {currentUserData?.email?.slice(0, 2) || "AD"}
                                    </div>
                                    <div className="hidden sm:block min-w-0 text-left">
                                        <div className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-200">{currentUserName}</div>
                                        <div className="truncate text-[9px] uppercase tracking-wider font-bold text-yellow-600 dark:text-yellow-500">
                                            Management space
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </SettingsPopover>
                    </div>
                </div>
            </header>

            {/* VÙNG HIỂN THỊ MAIN DATA */}
            <main className="flex-1 p-6 lg:p-12 max-w-6xl w-full mx-auto space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <ShieldAlert className="h-8 w-8 text-zinc-800 dark:text-zinc-200" />
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">USER MANAGEMENT</h1>
                </div>

                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Email</th>
                                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400">Status</th>
                                <th className="p-4 font-semibold text-sm text-zinc-600 dark:text-zinc-400 text-right pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {users?.map((u) => (
                                <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4 align-middle font-medium text-zinc-900 dark:text-zinc-100">
                                        <div>{u.email}</div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        {u.is_superuser ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                                                Superuser
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700">
                                                User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 align-middle text-right pr-8">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-md border-zinc-200 dark:border-zinc-800">
                                                <DropdownMenuItem
                                                    onClick={() => openUpdateModal(u)}
                                                    className="cursor-pointer flex items-center gap-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                                                >
                                                    <User className="h-4 w-4 text-zinc-400" />
                                                    <span>Update info</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => onToggleAdmin(u)}
                                                    className="cursor-pointer flex items-center gap-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-300"
                                                >
                                                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                                                    <span>{u.is_superuser ? "Revoke SuperUser" : "Grant SuperUser"}</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => onDeleteUser(u.id, u.email)}
                                                    className="cursor-pointer flex items-center gap-2.5 py-2 text-sm text-red-600 dark:text-red-400 font-medium focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete Account</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* DIALOG CHỈNH SỬA THÔNG TIN */}
            <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">Cập nhật tài khoản</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Địa chỉ Email</label>
                            <Input
                                type="email"
                                value={updateEmail}
                                onChange={(e) => setUpdateEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mật khẩu mới (Nếu có)</label>
                            <PasswordInput
                                value={updatePassword}
                                onChange={(e) => setUpdatePassword(e.target.value)}
                                placeholder="Bỏ trống nếu không muốn đổi"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" className="rounded-lg" onClick={() => setIsUpdateModalOpen(false)}>Hủy</Button>
                        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-lg font-semibold" onClick={onConfirmUpdateInfo}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
