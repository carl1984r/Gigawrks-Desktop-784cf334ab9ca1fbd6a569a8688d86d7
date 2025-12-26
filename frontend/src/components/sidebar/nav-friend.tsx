"use client"

import {
    ChevronRight,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Auth} from "../../../wailsjs/go/models"


interface NavUserProps {
    user?: Auth.Contact,
    isOnline?: boolean
    onClick?: () => void
}

export function NavFriend(user: NavUserProps) {
    return (
        <SidebarMenu>
            <SidebarMenuItem onClick={user.onClick}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.user?.user_image} alt={user.user?.first_name}/>
                                <AvatarFallback
                                    className="rounded-lg">{`${user.user?.first_name ? user.user?.first_name[0] : ''}${user.user?.last_name ? user.user?.last_name[0] : ''}`}</AvatarFallback>
                                {user.isOnline && (
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                                )}
                            </Avatar>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span
                                    className="truncate font-medium">{user.user?.first_name} {user.user?.last_name}</span>
                                <span className="truncate text-xs">{user.user?.gigatag}</span>
                            </div>
                            <ChevronRight className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
