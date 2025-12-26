import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.tsx";
import Friends from "./pages/friends.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { WebSocketProvider } from './components/WebSocketProvider.tsx';
function App() {
    return (<WebSocketProvider>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />}/>
                <Route path="/" element={<ProtectedRoute>
                                <Friends />
                        </ProtectedRoute>}/>
            </Routes>
        </BrowserRouter>
        </WebSocketProvider>);
}
export default App;
