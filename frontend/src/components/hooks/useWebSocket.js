import { useEffect, useRef } from "react";
import { GetAccessToken, IsLoggedIn } from "../../../wailsjs/go/main/App";
export function useWebSocket(url, enabled) {
    const wsRef = useRef(null);
    useEffect(() => {
        if (!enabled)
            return;
        const onlineWS = new WebSocket(url);
        wsRef.current = onlineWS;
        IsLoggedIn().then(r => {
            onlineWS.onopen = () => {
                if (r) {
                    GetAccessToken().then(token => {
                        onlineWS.send(JSON.stringify({ type: "auth", token: 'Bearer ' + token }));
                        console.log("✅ WS Connected");
                    });
                }
                else
                    onlineWS.close();
            };
        });
        onlineWS.onmessage = (event) => {
            console.log("📩 Message from server:", event.data);
        };
        onlineWS.onclose = () => {
            console.log("❌ WS Disconnected");
            setTimeout(() => useWebSocket(url, enabled), 3000);
        };
        onlineWS.onerror = (err) => {
            console.error("⚠️ WS Error:", err);
        };
        return () => {
            onlineWS.close();
        };
    }, [url, enabled]);
    return wsRef;
}
