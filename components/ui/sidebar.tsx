'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  LayoutDashboard,
  FileText,
  Edit,
  Image,
  Bell,
  Users,
  GraduationCap,
  UserPlus,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  School,
  BookOpen,
  Award
} from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  schoolName: string
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems = [
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    category: 'main'
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: FileText,
    category: 'main'
  },
  {
    id: 'about-section',
    label: 'About Section',
    icon: Edit,
    category: 'content'
  },
  {
    id: 'gallery',
    label: 'Manage Gallery',
    icon: Image,
    category: 'content'
  },
  {
    id: 'notices',
    label: 'Update Notices',
    icon: Bell,
    category: 'content'
  },
  {
    id: 'featured-students',
    label: 'Featured Students',
    icon: Award,
    category: 'content'
  },
  {
    id: 'teachers',
    label: 'Manage Teachers',
    icon: Users,
    category: 'management'
  },
  {
    id: 'create-teacher',
    label: 'Add Teacher',
    icon: UserPlus,
    category: 'management'
  },
  {
    id: 'students',
    label: 'Manage Students',
    icon: GraduationCap,
    category: 'management'
  },
  {
    id: 'create-student',
    label: 'Add Student',
    icon: UserPlus,
    category: 'management'
  },
  {
    id: 'results',
    label: 'Create Results',
    icon: BarChart3,
    category: 'academic'
  },
  {
    id: 'exams',
    label: 'Manage Exams',
    icon: BookOpen,
    category: 'academic'
  },
  {
    id: 'settings',
    label: 'Site Settings',
    icon: Settings,
    category: 'system'
  }
]

const categories = {
  main: 'Dashboard',
  content: 'Content Management',
  management: 'User Management',
  academic: 'Academic',
  system: 'System'
}

export function Sidebar({ 
  activeSection, 
  onSectionChange, 
  schoolName, 
  collapsed = false,
  onToggleCollapse 
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, typeof menuItems>)

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <School className="h-6 w-6 text-green-600" />
              <div>
                <h2 className="font-semibold text-gray-900 text-sm truncate">
                  {schoolName}
                </h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          )}
          {collapsed && (
            <School className="h-6 w-6 text-green-600 mx-auto" />
          )}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="p-1 h-6 w-6"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {categories[category as keyof typeof categories]}
                </h3>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  const isHovered = hoveredItem === item.id

                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-9 px-3 text-sm font-medium transition-colors",
                        collapsed ? "px-2" : "px-3",
                        isActive 
                          ? "bg-green-100 text-green-700 hover:bg-green-100" 
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => onSectionChange(item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        collapsed ? "mx-auto" : "mr-3",
                        isActive ? "text-green-600" : "text-gray-500"
                      )} />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {collapsed && isHovered && (
                        <div className="absolute left-16 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  )
}