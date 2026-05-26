"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import SimpleForm from "./simpleForm"
import ReviewCard from "./ReviewCard"
import { useReviewActions } from "@/src/api/reviews/useReviews"
import { FileText, AngryIcon } from "lucide-react"
import SettingsPopover from "@/src/components/SettingsPopover"
import { useUserActions } from '@/src/api/user/useUser';
export default function Review() {

    const [page, setPage] = useState(1);
    const [reviewsList, setReviews] = useState<any[]>([]);
    const [filters, setFilters] = useState({ search: "", professor_name: "", course_name: "" })

    const handleSearchSubmit = (newFilters: typeof filters) => {
        setReviews([])
        setPage(1)
        setFilters(newFilters)
    }

    const { data: user } = useUserActions()
    const name = user?.email.split("@")[0];
    const { reviews, error, total } = useReviewActions({
        page_size: 30,
        page: page,
        search: filters.search,
        professor_name: filters.professor_name,
        course_name: filters.course_name
    });
    const handleLoadMoreData = () => {
        try {
            if (reviews && !error) {
                setPage(page + 1)
                setReviews((prevItems) => [...prevItems, ...reviews]);
            }
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-screen w-full" >
            <header className="bg-card border-b border-border px-4 lg:px-8 py-3 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 pl-6 lg:pl-0">
                        <Link
                            href="/doc"
                            className="flex items-center gap-2.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            Doc
                            <FileText className="h-5 w-5" />
                        </Link>

                        <Link
                            href="/chat"
                            className="flex items-center gap-2.5 rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:bg-zinc-900"
                        >
                            <AngryIcon className="h-4 w-4" />
                            Chat
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <SettingsPopover>
                            <button className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                <div className="flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
                                        JD
                                    </div>
                                    <div className="hidden sm:block min-w-0 text-left">
                                        <div className="truncate text-sm font-semibold">{name}</div>
                                        <div className="truncate text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Pro workspace
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </SettingsPopover>
                    </div>



                </div>
            </header>

            <SimpleForm
                onSearch={handleSearchSubmit}
            />

            <div
                id="scrollableDiv"
                className="flex-1 overflow-y-auto p-4 lg:p-8"
            >
                <InfiniteScroll
                    dataLength={reviewsList.length}
                    next={handleLoadMoreData}
                    hasMore={total ? total > reviewsList.length : false}
                    loader={<p className="text-center py-4 text-sm text-zinc-500">Loading more reviews...</p>}
                    endMessage={<p className="text-center py-4 text-sm text-zinc-500">No more data to load.</p>}
                // scrollableTarget="scrollableDiv"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewsList.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </InfiniteScroll>
            </div>
        </div >
    )
}
