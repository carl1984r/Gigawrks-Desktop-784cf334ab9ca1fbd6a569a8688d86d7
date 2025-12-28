"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
    QrCode,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
// import {useEffect, useState} from "react";
import {Logout} from "../../../wailsjs/go/main/App"
import {Auth} from "../../../wailsjs/go/models"
import {useNavigate} from "react-router-dom";


interface NavUserProps {
    user?: Auth.User
    setIsQrModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function NavUser({ user, setIsQrModalOpen }: NavUserProps) {
    const {isMobile} = useSidebar()
    // const [loggedInUser, setUser] = useState<Auth.User>(new Auth.User)
    const navigate = useNavigate();

    const handleOpenQr = () => setIsQrModalOpen(true);
    // Re-check login whenever localStorage changes
    // useEffect(() => {
    //   const GetLoggedInUser = async () => {
    //     const loggedIn = await GetLoggedInUserData();
    //     console.log("GetLoggedInUser", loggedIn)
    //     setUser(loggedIn);
    //   };
    //
    //   GetLoggedInUser();
    //   // console.log("GetLoggedInUser", loggedInUser);
    //   // listen for login/logout events
    //   window.addEventListener("user", GetLoggedInUser);
    //   return () => {
    //     window.removeEventListener("user", GetLoggedInUser);
    //   };
    // }, []);
    const logOut = () => {
        Logout().then(r => {
                console.log("logOut", r);
                if (r) navigate("/login");
            }
        )
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user?.user_image} alt={user?.first_name}/>
                                <AvatarFallback className="rounded-lg">{`${user?.first_name ? user?.first_name[0] : ''}${user?.last_name ? user?.last_name[0] : ''}`}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{`${user?.first_name} ${user?.last_name}`}</span>
                                <span className="truncate text-xs">{user?.gigatag}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.user_image} alt={user?.first_name}/>
                                    <AvatarFallback className="rounded-lg">{`${user?.first_name ? user?.first_name[0] : ''}${user?.last_name ? user?.last_name[0] : ''}`}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user?.first_name}</span>
                                    <span className="truncate text-xs">{user?.gigatag}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles/>
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck/>
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard/>
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleOpenQr}>
                                <QrCode />
                                My QR/Gigatag
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell/>
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logOut}>
                            <LogOut/>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
