
"use client"
import React from "react"
import { ReviewPublic } from "@/src/api/model"
import { Star } from "lucide-react"
export default function ReviewCard({ review }: { review: ReviewPublic }) {

    // Index:       0 (None),    1 (Bad),    2 (Poor),   3 (Average), 4 (Good),   5 (Excellent)
    const starColors = ["#9CA3AF", "#EF4444", "#F97316", "#FACC15", "#4ADE80", "#22C55E"];
    return (
        /* Changed p-8 to p-10 for more padding (40px) */
        <article className="m-4 p-10 bg-surface-container-lowest rounded-xl transition-all hover:shadow-[0px_20px_40px_rgba(50,41,79,0.06)] border-3 border-black">

            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h4 className="font-headline font-bold text-on-surface">
                            {review.prof_name || "Không Rõ"}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                            {review.course_name || "Không Rõ"}
                        </p>
                    </div>
                </div>

                <div className="bg-tertiary-container px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="text-on-tertiary-container font-bold text-base leading-none">
                        {review.rating}/5
                    </span>
                    <Star
                        fill={starColors[review.rating || 1]}
                    >
                    </Star> </div>
            </div>

            <div className="text-on-surface-variant leading-relaxed mb-6">
                <div className="pt-1 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-center gap-0 text-sm"></div>
                <p>{review.content}</p>
            </div>

            <div className="flex items-center justify-between border-t border-surface-container pt-6">
                <div className="flex gap-4"></div>
                <span className="text-xs text-on-surface-variant">
                    {review.created_at || "Không Rõ"}
                </span>
            </div>
        </article >
    )
}
