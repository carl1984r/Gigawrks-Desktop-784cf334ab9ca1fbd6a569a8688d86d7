import { SidebarIcon, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect } from "react"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar()
  // const [theme, setTheme] = useState<"light" | "dark">("light")

  // 🔹 Load saved theme or system preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const initialTheme = storedTheme || (prefersDark ? "dark" : "light")
    // setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])
  // const { toggleTheme } = useTheme()
  const notifications = [
    { id: 1, title: "New Message", description: "John sent you a file", time: "2m ago", unread: true },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
    { id: 1, title: "New Message", description: "John sent you a file", time: "2m ago", unread: true },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
    { id: 2, title: "Meeting Alert", description: "Giga-Room #4 starts in 5 mins", time: "1h ago", unread: false },
  ];

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
                {/* Red dot for unread status */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-0 bg-slate-900 border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-white">
                Mark all read
              </Button>
            </div>
              <div className="max-h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors cursor-pointer group`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className={`text-sm leading-none ${n.unread ? "text-white font-medium" : "text-slate-400"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {n.description}
                        </p>
                      </div>
                      {n.unread && <div className="h-2 w-2 rounded-full bg-blue-500 mt-1" />}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 uppercase font-bold tracking-wider">{n.time}</p>
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
