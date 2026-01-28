"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SidebarItem } from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Settings,
} from 'lucide-react'

const menuItems = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/agents', label: 'Agentes IA', icon: Bot },
  { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
]

export function SidebarMenu() {
  const pathname = usePathname()

  return (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href}>
            <SidebarItem active={isActive}>
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </SidebarItem>
          </Link>
        )
      })}
    </>
  )
}
