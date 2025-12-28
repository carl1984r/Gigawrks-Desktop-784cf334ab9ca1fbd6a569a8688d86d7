import {type Dispatch, type SetStateAction} from "react";
import {IsLoggedIn} from "../../../wailsjs/go/main/App";
import {addOrUpdateStream, type userStreams} from "@/components/utils/remoteStreams.tsx";

export interface viewer{
    audio_track_id: string | null
    first_name:  string | null
    gigatag: string | null
    id: number
    last_name: string | null
    mic_enabled: boolean | null
    moderator: boolean | false
    owner:  boolean | null
    screen_track_id: string | null
    screenshare_enabled: boolean | null
    user_image: string | null
    vid_enabled: boolean | null
    video_track_id: string | null
}

export const fakeViewers: viewer[] = [
    {
        audio_track_id: "audio1",
        first_name: "Alice",
        gigatag: "@alice123",
        id: 1,
        last_name: "Johnson",
        mic_enabled: true,
        moderator: true,
        owner: true,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/women/1.jpg",
        vid_enabled: true,
        video_track_id: "video1",
    },
    {
        audio_track_id: "audio2",
        first_name: "Bob",
        gigatag: "@bobster",
        id: 2,
        last_name: "Smith",
        mic_enabled: false,
        moderator: false,
        owner: false,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/men/2.jpg",
        vid_enabled: false,
        video_track_id: null,
    },
    {
        audio_track_id: "audio3",
        first_name: "Clara",
        gigatag: "@clarity",
        id: 3,
        last_name: "Lopez",
        mic_enabled: true,
        moderator: false,
        owner: false,
        screen_track_id: "screen3",
        screenshare_enabled: true,
        user_image: "https://randomuser.me/api/portraits/women/3.jpg",
        vid_enabled: true,
        video_track_id: "video3",
    },
    {
        audio_track_id: "audio4",
        first_name: "David",
        gigatag: "@dave",
        id: 4,
        last_name: "Wong",
        mic_enabled: false,
        moderator: false,
        owner: false,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/men/4.jpg",
        vid_enabled: false,
        video_track_id: null,
    },
    {
        audio_track_id: "audio5",
        first_name: "Ella",
        gigatag: "@ellabella",
        id: 5,
        last_name: "Brown",
        mic_enabled: true,
        moderator: false,
        owner: false,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/women/5.jpg",
        vid_enabled: true,
        video_track_id: "video5",
    },
    {
        audio_track_id: "audio6",
        first_name: "Frank",
        gigatag: "@franky",
        id: 6,
        last_name: "Taylor",
        mic_enabled: true,
        moderator: false,
        owner: false,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/men/6.jpg",
        vid_enabled: false,
        video_track_id: null,
    },
    {
        audio_track_id: "audio7",
        first_name: "Grace",
        gigatag: "@graceful",
        id: 7,
        last_name: "Nguyen",
        mic_enabled: true,
        moderator: false,
        owner: false,
        screen_track_id: null,
        screenshare_enabled: false,
        user_image: "https://randomuser.me/api/portraits/women/7.jpg",
        vid_enabled: true,
        video_track_id: "video7",
    },
    {
        audio_track_id: "audio8",
        first_name: "Henry",
        gigatag: "@henrydev",
        id: 8,
        last_name: "Garcia",
        mic_enabled: false,
        moderator: true,
        owner: false,
        screen_track_id: "screen8",
        screenshare_enabled: true,
        user_image: "https://randomuser.me/api/portraits/men/8.jpg",
        vid_enabled: true,
        video_track_id: "video8",
    },
];
function parseStreamId(streamId: string) {
    const match = streamId.match(/^user-(\d+)(?:-|$)/);
    if (!match) return null;

    return {
        userId: parseInt(match[1], 10),
        trackType: "mixed", // kept for compatibility; not used in single-PC mode
    };
}


export const setupRoomOntrack = async (
    PC: RTCPeerConnection,
    kind: string, // kept to match your signature (ignored)
    setRemoteStreams: Dispatch<SetStateAction<Map<number, userStreams>>>
) => {
    PC.ontrack = async (event) => {
        const selfId = await IsLoggedIn();

        const stream = event.streams?.[0];
        if (!stream) return;

        const streamParse = parseStreamId(stream.id);

        console.log(
            `user peerConnection (single) kindArg=${kind} trackKind=${event.track.kind} trackId=${event.track.id} streamId=${stream.id} selfId = ${selfId}`
        );

        event.track.onended = () => {
            try {
                event.track.stop();
            } catch {}
        };

        // If we can't parse a userId, ignore (or handle differently)
        if (!streamParse?.userId) return;

        // Don't add our own loopback tracks to remote
        if (streamParse.userId === selfId) {
            console.log("streamParse.userId, selfId", streamParse.userId, selfId)
            event.track.stop();
            return;
        }

        // Route by the REAL track kind (audio/video)
        let st: Partial<userStreams> = {};
        if (event.track.kind === "audio") {
            st = { audio: stream };
        } else if (event.track.kind === "video") {
            st = { video: stream };
        } else {
            return;
        }
        window.setTimeout(() => {
          addOrUpdateStream(streamParse.userId, st, setRemoteStreams);
        }, 4000);

    };
};
export const setupOnIceCandidate = async (PC: RTCPeerConnection, kind: string, sendMessage: (arg0: string) => void) => {
    PC.onicecandidate = (event) => {
        if (event.candidate) {
            console.log(`Room ICE Candidate Type found: ${event.candidate}`);
            sendMessage(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
                call_type: kind
            }))
        }
    }
}

export const setupRoomRenegotiateConnection = async (PC: RTCPeerConnection, kind: string, sendMessage: (arg0: string) => void) => {
    PC.onnegotiationneeded = async () => {
        await renegotiateConnection(PC, kind, sendMessage);
    };
}

export const renegotiateConnection = async (PC: RTCPeerConnection, _kind: string, sendMessage: (arg0: string) => void) => {
    try {
        if (PC.signalingState !== "stable") {
            console.log("Skip negotiation, state =", PC.signalingState);
            return;
        }
        const offer = await PC.createOffer();
        await PC.setLocalDescription(offer);
        sendMessage(JSON.stringify({
                "type": `offer`,
                "sdp":PC?.localDescription?.sdp,
            })
        );
    } catch (err) {
        console.log("Negotiation error==================================", err);
    }
}
