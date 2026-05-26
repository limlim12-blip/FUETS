"use client"
import React, { useState } from "react"
import { Search, GraduationCap, BookOpen } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/src/components/ui/combobox"
import { useProfActions } from "@/src/api/professors/useProfessors"
import { useCourseActions } from "@/src/api/courses/useCoures"


export function ComboboxBasic({
    onSelectValue,
    placeholder,
    frameworks = []
}: {
    onSelectValue: (value: string | null) => void
    placeholder: string
    frameworks: readonly string[] | string[]
}) {
    return (<Combobox
        onValueChange={(value) => {
            onSelectValue(value)
        }}
        items={frameworks}>
        <ComboboxInput
            placeholder={placeholder}
            className="w-full bg-slate-50 dark:bg-slate-950/50 h-12 rounded-xl border border-slate-200 dark:border-slate-800 focus-visible:ring-1 focus-visible:ring-blue-500"
        />
        <ComboboxContent
            className="w-[--radix-combobox-trigger-width] z-[9999] max-h-[300px]"
            side="bottom"
            align="start"
        >
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
                {(item) => (
                    <ComboboxItem key={item} value={item}>
                        {item}
                    </ComboboxItem>
                )}
            </ComboboxList>
        </ComboboxContent>
    </Combobox>
    )
}
interface SearchFilters {
    search: string
    professor_name: string
    course_name: string
}
export default function SimpleForm({ onSearch }: { onSearch: (filters: SearchFilters) => void }) {
    const [search, setSearch] = useState("")
    const [chosenProf, setChosenProf] = useState("")
    const [chosenCourse, setChosenCourse] = useState("")

    const { Profs = [] } = useProfActions({ limit: 9999 })
    const { Courses = [] } = useCourseActions({ limit: 9999 })
    const names: string[] = Profs.map((prof) => prof.name);
    const profNames = Array.from(new Set(names))
    const courses: string[] = Courses.map((prof) => prof.name);
    const courseName = Array.from(new Set(courses))
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        onSearch({
            search: search.trim(),
            professor_name: chosenProf,
            course_name: chosenCourse
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 mb-10 items-end border border-black"
        >
            <div className="md:col-span-5 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                    Từ khóa
                </label>
                <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Ví dụ: yêu anh Toàn <3"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 h-12 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition"
                    />
                </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5 select-none">
                    <GraduationCap className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Giảng Viên</span>
                </label>
                <div className="relative">
                    <ComboboxBasic
                        placeholder="Tìm tên giảng viên"
                        frameworks={profNames}
                        onSelectValue={(value) => setChosenProf(value)}
                    />
                </div>
            </div>

            <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5 select-none">
                    <BookOpen className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>Môn Học</span>
                </label>
                <div className="relative">
                    <ComboboxBasic
                        placeholder="Tìm môn học"
                        frameworks={courseName}
                        onSelectValue={(value) => setChosenCourse(value)}
                    />

                </div>
            </div>

            <div className="md:col-span-1">
                <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition duration-200 rounded-xl flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700 shrink-0"
                >
                    <Search className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="md:hidden ml-2 text-sm font-medium">Tìm kiếm</span>
                </Button>
            </div>
        </form >
    )
}
