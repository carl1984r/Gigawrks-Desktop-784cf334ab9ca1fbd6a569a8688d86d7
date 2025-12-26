// pages/friends.tsx
import { useEffect } from "react";
import { IsLoggedIn } from "../../wailsjs/go/main/App";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/app-sidebar.tsx";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar.tsx";
import { SiteHeader } from "../components/site-header.tsx";
export default function Home() {
    const navigate = useNavigate();
    useEffect(() => {
        IsLoggedIn().then(islogin => {
            if (islogin > 0)
                navigate("/login");
        });
    }, []);
    return (<div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeader />
                <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset>
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                                <div className="bg-muted/50 aspect-video rounded-xl"/>
                                <div className="bg-muted/50 aspect-video rounded-xl"/>
                                <div className="bg-muted/50 aspect-video rounded-xl"/>
                            </div>
                            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"/>
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>);
}
