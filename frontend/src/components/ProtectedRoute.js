import { Navigate } from "react-router-dom";
import { IsLoggedIn } from "../../wailsjs/go/main/App";
export function ProtectedRoute({ children }) {
    if (!IsLoggedIn()) {
        return <Navigate to="/" replace/>;
    }
    return children;
}
