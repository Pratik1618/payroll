"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"


interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  useEffect(() => {
    const savedState = window.localStorage.getItem("sidebar-collapsed")
    if (savedState === "true") {
      setIsSidebarCollapsed(true)
    }
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem("sidebar-collapsed", String(next))
      return next
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
