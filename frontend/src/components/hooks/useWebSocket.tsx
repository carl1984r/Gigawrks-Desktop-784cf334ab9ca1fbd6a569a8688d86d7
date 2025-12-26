import { useEffect, useRef } from "react";
import {GetAccessToken} from "../../../wailsjs/go/main/App";

export function useWebSocket(url: string, enabled: boolean, onOpen: () => void) {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!enabled) return;
        const onlineWS = new WebSocket(url);
        wsRef.current = onlineWS;
        onlineWS.onopen = () => {
            GetAccessToken().then(token => {
                onlineWS.send(JSON.stringify({type: "auth", token: 'Bearer ' + token}));
                console.log("✅ WS Connected");
                onOpen()
            })
        };

        onlineWS.onclose = () => {
            console.log("❌ WS Disconnected");
            // setTimeout(() => useWebSocket(url, enabled), 3000);
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