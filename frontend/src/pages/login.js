// src/pages/Login.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import { useState, useEffect } from "react";
import logo from "@/assets/gigawrks.svg";
import { LoginWithEmail, IsLoggedIn } from "../../wailsjs/go/main/App";
import { useNavigate } from "react-router-dom";
export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isDark, setIsDark] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    // Sync theme with body class
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        }
        else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);
    useEffect(() => {
        const checkLogin = async () => {
            const loggedIn = await IsLoggedIn();
            setLoggedIn(loggedIn);
        };
        checkLogin();
        if (loggedIn) {
            window.dispatchEvent(new Event("storage"));
            navigate("/");
        }
    }, []);
    const handleLogin = async () => {
        console.log("Login with:", { email, password });
        let loginResponse = await LoginWithEmail(email, password);
        if (loginResponse !== "") {
            const loggedin = await IsLoggedIn();
            console.log("loggedin", loggedin);
            if (loggedin) {
                window.dispatchEvent(new Event("storage"));
                navigate("/");
            }
        }
        console.log(loginResponse);
    };
    const handleGoogleLogin = () => {
        console.log("Google login clicked");
    };
    return (<div className="min-h-screen flex bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
            {/* Left Logo Section */}
            <div className=" dark:text-white hidden sm:flex flex-1 items-center justify-center bg-gray-200 dark:bg-gray-900">
                <img src={logo} alt="Gigawrks Logo" className="max-w-xs w-2/3"/>
                <h1 className="text-3xl font-bold leading-tight"> Welcome to Gigawrks</h1>
            </div>



            {/* Right Login Section */}
            <div className="flex flex-1 items-center justify-center p-6">
                <Card className="w-full max-w-md shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300">
                    <CardHeader className="flex flex-col items-center">
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Login
                        </CardTitle>

                        {/* Dark Mode Switch */}
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Light</span>
                            <Switch checked={isDark} onCheckedChange={setIsDark}/>
                            <span className="text-sm text-gray-600 dark:text-gray-400">Dark</span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 p-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                Email
                            </Label>
                            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"/>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                Password
                            </Label>
                            <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"/>
                        </div>

                        {/* Login Button */}
                        <Button className="w-full" onClick={handleLogin}>
                            Login
                        </Button>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-300 dark:border-gray-700"/>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
                            </div>
                        </div>

                        {/* Google Button */}
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" onClick={handleGoogleLogin}>
                            <FcGoogle size={20}/>
                            Google
                        </Button>

                        {/* Twitter Button */}
                        <Button variant="outline" className="w-full flex items-center justify-center gap-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" onClick={handleGoogleLogin}>
                            <FaXTwitter size={20}/>
                            X
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>);
}
