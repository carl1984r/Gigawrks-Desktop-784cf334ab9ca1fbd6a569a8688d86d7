import { SidebarIcon } from "lucide-react"
import { SearchForm } from "@/components/search-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect } from "react"
import useTheme from "@/components/hooks/useTheme.tsx";

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
  const { theme, toggleTheme } = useTheme()
  return (
      <header className="bg-sidebar sticky top-0 z-50 flex w-full items-center border-b">
        <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
          <Button
              className="h-8 w-8 mt-6"
              variant="link"
              size="icon"
              onClick={toggleSidebar}
          >
            <SidebarIcon />
          </Button>

          <Separator orientation="vertical" className="mr-2 h-4" />

          <SearchForm className="w-full sm:ml-auto sm:w-auto" />


          <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded bg-primary text-foreground"
          >
            Switch Theme ({theme})
          </button>
        </div>
      </header>
  )
}
