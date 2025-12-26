import type {Dispatch, SetStateAction} from "react";

export interface userStreams{
    video?: MediaStream | null;
    audio?: MediaStream | null;
    screen?: MediaStream | null;
}

export const addOrUpdateStream = (userId: number|undefined, newStream: Partial<userStreams>, setRemoteStreams: Dispatch<SetStateAction<Map<number, userStreams>>>) => {
    if (userId){
        setRemoteStreams((prev) => {
            const updated = new Map(prev);
            const existing = updated.get(userId) || {};
            updated.set(userId, { ...existing, ...newStream });
            return updated;
        });
    }

};

export const removeStreamType = (userId: number, type: keyof userStreams, setRemoteStreams: Dispatch<SetStateAction<Map<number, userStreams>>>) => {
    setRemoteStreams((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(userId);
        if (existing) {
            const newEntry = { ...existing, [type]: null };
            updated.set(userId, newEntry);
        }
        return updated;
    });
};

export const removeUser = (userId: number, setRemoteStreams: Dispatch<SetStateAction<Map<number, userStreams>>>) => {
    setRemoteStreams((prev) => {
        const updated = new Map(prev);
        updated.delete(userId);
        return updated;
    });
};