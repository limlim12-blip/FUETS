"use client"
import { useState } from "react"
import React from 'react';
import { Paperclip, Bot, BookOpen } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"

export default function ComposerActionsPopover({ children }) {
    const [open, setOpen] = useState(false)

    const mainActions = [
        {
            icon: Paperclip,
            label: "Add photos & files",
            badge: "TODO",

            action: () => console.log("Add photos & files"),
        },
        {
            icon: Bot,
            label: "Change param",
            badge: "TODO",
            action: () => console.log("param"),
        },
    ]

    const handleAction = (action) => {
        action()
        setOpen(false)
    }

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen)
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="top">
                <div className="p-2 min-w-[220px]">
                    <div className="space-y-0.5">
                        {mainActions.map((action, index) => {
                            const IconComponent = action.icon
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleAction(action.action)}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <IconComponent className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                                    <span>{action.label}</span>
                                    {action.badge && (
                                        <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">
                                            {action.badge}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
