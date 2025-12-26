import { useState, useEffect } from "react"

const themes = ["light", "dark", "forest", "sunset", "boys", "girls", "sky"] // add as many as you want

export default function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "light"
    })

    useEffect(() => {
        // Remove all theme classes and apply the current one
        document.documentElement.classList.remove(...themes)
        document.documentElement.classList.add(theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => {
        const currentIndex = themes.indexOf(theme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        setTheme(nextTheme)
    }

    return { theme, toggleTheme }
}
