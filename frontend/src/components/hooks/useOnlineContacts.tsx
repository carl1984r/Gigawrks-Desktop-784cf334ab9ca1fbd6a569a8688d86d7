import { useEffect, useState } from "react";
import { EventsOn } from "../../../wailsjs/runtime";
import {GetOnlineContacts} from "../../../wailsjs/go/main/App";

export function useOnlineContacts() {
    const [onlineContacts, setOnlineContacts] = useState<number[]>([]);
    useEffect(() => {
        GetOnlineContacts().then(
            (oContacts)=>{
                setOnlineContacts(oContacts);
            }
        )
        const off = EventsOn("online_contacts", (msg) => {
            console.log("online_contacts event:", msg);
            if (Array.isArray(msg)) {
                setOnlineContacts(msg);
            }
        });
        console.log(onlineContacts)
        return () => {
            off();
        };
    }, []);
    useEffect(() => {
        const off = EventsOn("online_status_update", (msg) => {
            // GetOnlineContacts().then(
            //     (contacts) =>  setOnlineContacts(contacts),
            // )
            // // setOnlineContacts()
            if (!msg) return;
            const { userId, status } = msg;

            setOnlineContacts((prev) => {
                if (status === 1 && !prev.includes(userId)) {
                    // 🟢 User went online
                    return [...prev, userId];
                } else if (status === 0) {
                    // 🔴 User went offline
                    return prev.filter((id) => id !== userId);
                }
                return prev;
            });
        });

        return () => off();
    }, []);

    return onlineContacts;
}