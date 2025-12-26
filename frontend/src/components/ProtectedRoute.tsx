import { Navigate } from "react-router-dom";
import {cloneElement, type JSX, useEffect, useState} from "react";
import {IsLoggedIn} from "../../wailsjs/go/main/App";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [loading, setLoading] = useState(true)
    const [selfId, setSelfId] = useState<number>(0)
    useEffect(() => {
        const check = async () => {
            const loggedIn = await IsLoggedIn()
            setSelfId(loggedIn)
            setLoading(false)
        }
        check()
    }, [])

    if (loading) {
        return <div>Loading...</div> // or spinner
    }

    if (selfId <= 0) {
        return <Navigate to="/login" replace />
    }

    return cloneElement(children, { selfId: selfId });
    // if (!IsLoggedIn()) {
    //     return <Navigate to="/login" replace />;
    // }
    // return children;
}