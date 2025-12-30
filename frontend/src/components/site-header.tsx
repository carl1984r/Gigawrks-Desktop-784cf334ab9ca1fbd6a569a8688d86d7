import { SidebarIcon, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { EventsOn } from "../../wailsjs/runtime/runtime";
import { ConnectToNotificationsWS } from "../../wailsjs/go/main/App";

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  const [notificationsObject, setNotificationsObject] = useState<Notification[]>([]);

  interface Notification {
    notification_id: number;
    event: string;
    timestamp: string;
    interacted_at: string | null; // or null if it's a date string
    type: number;
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light")
    // setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")

    ConnectToNotificationsWS()
  
    const unsubscribe = EventsOn("new_notifications", (data) => {
      let parsedData = data;

      // If data is a string, parse it
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse notification JSON:", e);
          return;
        }
      }
      setNotificationsObject(parsedData.message);
      console.log("PARSED DATA MESSAGE", parsedData.message)
    });

    return () => unsubscribe();
  }, [])

  function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const secondsDiff = Math.round((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    // Handle seconds
    if (Math.abs(secondsDiff) < 60) return rtf.format(secondsDiff, 'second');

    // Handle minutes
    const minutesDiff = Math.round(secondsDiff / 60);
    if (Math.abs(minutesDiff) < 60) return rtf.format(minutesDiff, 'minute');

    // Handle hours
    const hoursDiff = Math.round(minutesDiff / 60);
    if (Math.abs(hoursDiff) < 24) return rtf.format(hoursDiff, 'hour');

    // Handle days
    const daysDiff = Math.round(hoursDiff / 24);
    return rtf.format(daysDiff, 'day');
  }

  return (
      <header className="bg-sidebar sticky top-0 z-50 flex w-full items-center border-b">
        <div className="flex h-(--header-height) w-full items-center">
          <Button
              className="h-8 w-8 mt-6 ml-3"
              variant="link"
              size="icon"
              onClick={toggleSidebar}
          >
            <SidebarIcon className="size-5 text-slate-400 hover:text-white transition-colors" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="h-12 w-12 absolute right-4 focus-visible:ring-0"
                variant="link"
                size="default"
              >
                <div className="relative">
                  <Bell className="size-6 text-slate-400 hover:text-white transition-colors" />
                  {/* Only show red dot if there are unread notifications */}
                  {Array.isArray(notificationsObject) && notificationsObject?.some(n => !n.interacted_at) && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-[40vw] p-0 bg-slate-900 border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <h4 className="text-sm font-semibold text-white">Notifications</h4>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-white">
                  Mark all read
                </Button>
              </div>

              <div className="max-h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                {notificationsObject?.length > 0 ? (
                  notificationsObject.map((n) => (
                    <div
                      key={n.notification_id}
                      className="p-4 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-row items-start gap-4">
                        {/* 1. Text Container (flex-1 lets it grow/shrink) */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className={`text-sm leading-tight truncate ${!n.interacted_at ? "text-slate-100 font-semibold" : "text-slate-400"}`}>
                            {n.event}
                          </p>
                          <p className="text-xs text-slate-500">
                            {/* You could put notification details here if available */}
                            {n.event}
                          </p>
                        </div>

                        {/* 2. Dot Container (fixed width prevents being pushed) */}
                        <div className="flex-shrink-0 w-2 mt-1.5">
                          {!n.interacted_at && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          )}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-600 mt-2 uppercase font-bold tracking-wider">
                        {timeAgo(n.timestamp)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                    <Bell className="size-8 mb-2 opacity-20" />
                    <p className="text-sm">All caught up!</p>
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-800">
                <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-white h-8">
                  View all activity
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </header>
  )
}
