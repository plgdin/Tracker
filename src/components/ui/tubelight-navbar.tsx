"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
  activeItem?: string
  onItemClick?: (item: NavItem) => void
}

export function NavBar({ items, className, activeItem, onItemClick }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(activeItem || items[0]?.name || "")
  const [, setIsMobile] = useState(false)

  useEffect(() => {
    if (activeItem) {
      setActiveTab(activeItem)
    }
  }, [activeItem])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-[#FCFAF7]/90 border border-[#E8D8CC] backdrop-blur-xl py-1.5 px-2 rounded-full shadow-lg shadow-[#4A2818]/5">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => {
                setActiveTab(item.name)
                if (onItemClick) {
                  onItemClick(item)
                }
              }}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 rounded-full transition-all duration-300 select-none flex items-center gap-2",
                "text-[#7A6153] hover:text-[#4A2818]",
                isActive && "text-[#4A2818]",
              )}
            >
              <span className="hidden md:inline font-serif">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.2} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-[#F2E7DC] rounded-full -z-10 border border-[#E8D8CC]"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 30,
                  }}
                >
                  {/* Tubelight Glow Lamp Effect */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#4A2818] rounded-t-full">
                    <div className="absolute w-12 h-6 bg-[#4A2818]/25 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-[#4A2818]/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-[#4A2818]/30 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
export default NavBar
