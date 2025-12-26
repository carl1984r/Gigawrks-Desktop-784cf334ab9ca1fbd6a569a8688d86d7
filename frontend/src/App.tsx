import './App.css'
import { Routes, Route, HashRouter } from "react-router-dom"
import Login from "./pages/login.tsx"
import Home from "./pages/home.tsx"
import {ProtectedRoute} from "./components/ProtectedRoute.tsx"
// import { WebSocketProvider } from './components/WebSocketProvider.tsx'
// import {ThemeProvider} from "@/components/theme-provider.tsx";

function App() {
    return (
        // <WebSocketProvider>
        // <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <HashRouter basename={"/"}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                                <Home selfId={0} />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </HashRouter>
        // </ThemeProvider>
        // </WebSocketProvider>

    )
}

export default App