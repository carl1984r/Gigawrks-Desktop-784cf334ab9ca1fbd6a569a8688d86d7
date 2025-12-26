import {useWebSocket} from "@/components/hooks/useWebSocket.tsx";
import {useEffect, useRef, useState} from "react";
import {
    renegotiateConnection,
    setupOnIceCandidate,
    setupRoomOntrack,
    setupRoomRenegotiateConnection,
    type viewer
} from "../utils/MeetingPeerConnection1";
import {type userStreams} from "@/components/utils/remoteStreams.tsx";
import BottomControls from "@/components/meeting/meetingBottomControls.tsx";
import MeetingParticipantsSidebar from "@/components/meeting/meetingParticipantsSidebar.tsx";
import {GetRoomDetails, GetRoomTurnCred, IsLoggedIn} from "../../../wailsjs/go/main/App";
import {webrtc, Auth} from "../../../wailsjs/go/models.ts";
import MeetingSettingsDialog from "@/components/meeting/MeetingSettingsDialog.tsx";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import VideoTile from "@/components/meeting/videoTile";
import { motion } from "framer-motion";
interface meetingCompoment{
    friendState: (arg0: Auth.Contact | null) => void
    meeting: string;
    meetingSettings: {
        micId: string | null,
        camId: string | null,
        audioOn: boolean,
        videoOn: boolean
    } | null;
}

export function MeetingComponent1({friendState, meeting, meetingSettings}:meetingCompoment) {
    // let audioStream: MediaStream | null;

    // let roomPcs: { audio: RTCPeerConnection | undefined; video: RTCPeerConnection | undefined } = {audio: undefined, video: undefined};
    const roomPcs = useRef<{ audio?: RTCPeerConnection; video?: RTCPeerConnection }>({});

    // const roomPcsRef = useRef(roomPcs);
    const candidateQueue =useRef<{ audio: RTCIceCandidate[]; video: RTCIceCandidate[] }> ({
        audio: [],
        video: []
    });
    const remoteDescriptionSet = useRef<{
        audio: boolean,
        video: boolean
    }>({
        audio: false,
        video: false
    });
    const [wsReady, setWsReady] = useState(false);
    const [audioStream, setAudioStream] = useState<MediaStream | null>()
    const audioStreamRef = useRef<MediaStream | null | undefined>(null);
    useEffect(() => { audioStreamRef.current = audioStream }, [audioStream]);
    const [videoStream, setVideoStream] = useState<MediaStream | null>()
    const videoStreamRef = useRef<MediaStream | null | undefined>(null);
    useEffect(() => { videoStreamRef.current = videoStream }, [videoStream]);
    const useWS = useWebSocket(`wss://4eabf0bfbd60.ngrok-free.app/room/${meeting}/ws`, true, () => setWsReady(true))

    const [remoteStreams, setRemoteStreams] = useState<Map<number, userStreams>>(new Map<number, userStreams>);

    const [meetingDetails, setMeetingDetails] = useState<webrtc.RoomCreateResponse>(new webrtc.RoomCreateResponse);
    let servers: RTCConfiguration
    const [viewers, setViewers] = useState<viewer[]>([]);
    const [isAudioOn, setIsAudioOn] = useState(meetingSettings?.audioOn ?? false);
    const [isVideoOn, setIsVideoOn] = useState(meetingSettings?.videoOn ?? false);
    const [mainViewer, setMainViewer] = useState<viewer | null>(null);

    const [selectedMic, setSelectedMic] = useState<string>(meetingSettings?.micId ?? "");
    const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
    const [selectedCam, setSelectedCam] = useState<string>(meetingSettings?.camId ?? "");
    const [selfID, setSelfID] = useState(0);
    // const [myViewer, setMyViewer] = useState<viewer>();
    useEffect(() => {
        IsLoggedIn().then((id) => setSelfID(id));
        // viewers.forEach(v => {
        //     if (v.id === selfID){
        //         setMyViewer(v)
        //     }
        // })
    }, [meeting]);


    const handleShare = async () => {
        const url = window.location.href;
        await navigator.clipboard.writeText(url);
        alert("Meeting link copied to clipboard!");
    };

    const contacts = [
        { id: "1", name: "Sarah Johnson", tag: "@sarah" },
        { id: "2", name: "John Doe", tag: "@john" },
    ]; // Example; replace with your real contact list

    const handleInvite = (contactTag: string) => {
        console.log("Inviting", contactTag);
        alert(`Invitation sent to ${contactTag}`);
    };
    // const mainStream = mainViewer ? remoteStreams.get(mainViewer.id) : null;
    // const isAudioOnRef = useRef(isAudioOn);

    // let localStream: MediaStream | null;
    const sendWsMessage = async (message: string) => {
        useWS.current?.send(message);
    };
    async function audioPub(enabled: boolean) {
        try {
            // Ensure peer connection exists
            if (!roomPcs.current.audio) {
                await createPeerConnection("audio");
            }

            // Reuse existing stream if available
            if (audioStream) {
                console.log("🔄 Toggling existing audio track:", enabled);
                audioStream.getAudioTracks().forEach(track => (track.enabled = enabled));

                // Also toggle sender tracks if needed
                roomPcs.current.audio?.getSenders()?.forEach(sender => {
                    if (sender.track?.kind === "audio") {
                        sender.track.enabled = enabled;
                    }
                });

                return; // ✅ Do NOT renegotiate, track already exists
            }

            // Otherwise, create once
            console.log("🎙️ Creating new audio stream...");
            // Get all available devices
            const devices = await navigator.mediaDevices.enumerateDevices();

            // Filter available video input devices
            const availableMics = devices.filter((d) => d.kind === "audioinput");

            // Check if selectedCam still exists
            const micExists = availableMics.some((mic) => mic.deviceId === selectedMic);

            // If selectedCam not found, fall back to default
            const deviceIdToUse = micExists ? selectedMic : undefined;
            console.log("deviceIdToUse audio", deviceIdToUse)
            console.log("selectedMic audio", selectedMic)
            console.log("isAudioOn audio", isAudioOn)
            const audioSt = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                },
            });

            const track = audioSt.getAudioTracks()[0];
            track.enabled = enabled;

            // Avoid adding duplicate audio senders
            const hasAudioSender = roomPcs.current.audio
                ?.getSenders()
                ?.some(s => s.track?.kind === "audio");
            if (!hasAudioSender) {
                roomPcs.current.audio?.addTrack(track);
            } else {
                console.warn("⚠️ Audio sender already exists, skipping addTrack()");
            }

            setAudioStream(audioSt);

            // Renegotiate only once after initial addTrack
            if (roomPcs.current.audio) await renegotiateConnection(roomPcs.current.audio, "audio", sendWsMessage);
        } catch (err) {
            console.error("audioPub() error:", err);
        }
    }
    async function videoPub(enabled: boolean) {
        try {
            // Ensure peer connection exists
            if (!roomPcs.current.video) {
                await createPeerConnection("video");
            }

            // Reuse existing stream if available
            if (videoStream) {
                console.log("🔄 Toggling existing audio track:", enabled);
                videoStream.getVideoTracks().forEach(track => (track.enabled = enabled));

                // Also toggle sender tracks if needed
                roomPcs.current.video?.getSenders()?.forEach(sender => {
                    if (sender.track?.kind === "video") {
                        sender.track.enabled = enabled;
                    }
                });

                return; // ✅ Do NOT renegotiate, track already exists
            }

            // Otherwise, create once
            console.log("🎙️ Creating new video stream...");
            // // Get all available devices
            const devices = await navigator.mediaDevices.enumerateDevices();

            // Filter available video input devices
            const availableCameras = devices.filter((d) => d.kind === "videoinput");

            // Check if selectedCam still exists
            const camExists = availableCameras.some((cam) => cam.deviceId === selectedCam);

            // If selectedCam not found, fall back to default
            const deviceIdToUse = camExists ? selectedCam : undefined;
            console.log("deviceIdToUse video", deviceIdToUse)
            console.log("selectedCam video", selectedCam)
            console.log("isVideoOn video", isVideoOn)
            const videoSt = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false,
                },
            });

            const track = videoSt.getVideoTracks()[0];
            track.enabled = enabled;

            // Avoid adding duplicate video senders
            const hasvideoSender = roomPcs.current.video
                ?.getSenders()
                ?.some(s => s.track?.kind === "video");
            if (!hasvideoSender) {
                roomPcs.current.video?.addTrack(track);
            } else {
                console.warn("⚠️ video sender already exists, skipping addTrack()");
            }

            setVideoStream(videoSt);

            // Renegotiate only once after initial addTrack
            if (roomPcs.current.video) await renegotiateConnection(roomPcs.current.video, "video", sendWsMessage);
        } catch (err) {
            console.error("videoPub() error:", err);
        }
    }
    const createPeerConnection = async (kind: string)  =>{
        if (!servers){
            const r = await GetRoomTurnCred(meeting)
            console.log("Servers response", r)
            if (r.status_code === 201){
                servers = {
                    iceServers: [
                        { 'urls': r.response.stun_url },
                        { 'urls': r.response.turn_url, username: r.response.user, credential: r.response.password }
                    ]
                }
            }else{
                console.log("r.status_code: error generating a servers creds: ", r.status_code, r.error)
            }


        }
        console.log("CREATING PC FOR ", kind)
        if (kind === 'audio'){
            console.log("servers:" ,servers)
            roomPcs.current.audio = new RTCPeerConnection(servers);
            await setupRoomOntrack(roomPcs.current.audio, kind, setRemoteStreams)
            await setupOnIceCandidate(roomPcs.current.audio, kind, sendWsMessage)
            await setupRoomRenegotiateConnection(roomPcs.current.audio, kind, sendWsMessage)
        }else if (kind === 'video'){
            roomPcs.current.video = new RTCPeerConnection(servers);
            await setupRoomOntrack(roomPcs.current.video, kind, setRemoteStreams)
            console.log("remoteStreams", remoteStreams)
            await setupOnIceCandidate(roomPcs.current.video, kind, sendWsMessage)
            await setupRoomRenegotiateConnection(roomPcs.current.video, kind, sendWsMessage)
        }
    }
    function initializeMeeting() {
        console.log("meetingDetails", meetingDetails)

        // await new Promise(resolve => );

        if (useWS.current){
            useWS.current.onmessage = async (evt) =>{
                // console.log("received message", evt.data)
                const msg = JSON.parse(evt.data);
                switch (msg.type){
                    case 'viewers':
                        console.log("Received viewer message", msg.users)
                        console.log(roomPcs.current.audio)
                        console.log(roomPcs.current.video)
                        setViewers(msg.users);
                        if (roomPcs.current.audio) {
                            await renegotiateConnection(roomPcs.current.audio, 'audio', sendWsMessage);
                        }
                        if (roomPcs.current.video) {
                            await renegotiateConnection(roomPcs.current.video, 'video', sendWsMessage);
                        }
                        break;
                    case 'offer-video':
                        console.log("OFFER VIDEO============================================")
                        if (!roomPcs.current.video){
                            await createPeerConnection('video')
                        }

                        await new Promise(r => setTimeout(r, 50)); // give event loop a tick
                        await handleRoomOffer(msg, 'video');
                        if (isVideoOn && !videoStreamRef.current) await videoPub(isVideoOn);
                        break;

                    case 'offer-audio':
                        console.log("OFFER AUDIO============================================")
                        if (!roomPcs.current.audio){
                            await createPeerConnection('audio')
                        }
                        await new Promise(r => setTimeout(r, 50)); // give event loop a tick
                        await handleRoomOffer(msg, 'audio');
                        if (isAudioOn && !audioStreamRef.current) await audioPub(isAudioOn);
                        break;
                    case 'ice-candidate-video':
                        await handleIceCandidate_(msg, 'video')
                        break;

                    case 'ice-candidate-audio':
                        await handleIceCandidate_(msg, 'audio');
                        break;
                    default:
                        break;
                }

            }
        }

        // if (!roomPcs.current.audio){
        //     createPeerConnection('audio').then()
        // }
        createPeerConnection('audio').then(() => console.log("created meeting", roomPcs.current.audio))
        createPeerConnection('video').then(() => console.log("created meetingPC", roomPcs.current.video))
        setIsAudioOn(true)
    }
    useEffect(() => {
        // Reset wsReady when meeting changes
        console.log("selectedMic audio", selectedMic)
        console.log("isAudioOn audio", isAudioOn)
        console.log("selectedCam video", selectedCam)
        console.log("isVideoOn video", isVideoOn)
        setWsReady(false);

        GetRoomDetails(meeting).then((r => setMeetingDetails(r.response)));
    }, [meeting]);
    useEffect(() => {
        if (!wsReady) return;
        console.log("SEt audio stream to ", audioStream)
        audioPub(isAudioOn).then(()=> console.log("Changed Audio pub", audioStream?.getAudioTracks()))
        sendWsMessage(JSON.stringify({
            "type": `stream-info-video`,
            "vid_enabled": isVideoOn,
            "mic_enabled": isAudioOn,
            "screenshare_enabled": false
        }))
    }, [isAudioOn]);
    useEffect(() => {
        if (!wsReady) return;
        console.log("SEt video stream to ", videoStream)
        videoPub(isVideoOn).then(()=> console.log("Changed isVideoOn pub", videoStream?.getVideoTracks()))
        sendWsMessage(JSON.stringify({
            "type": `stream-info-video`,
            "vid_enabled": isVideoOn,
            "mic_enabled": isAudioOn,
            "screenshare_enabled": false
        }))
    }, [isVideoOn]);
    //
    // useEffect(() => {
    //     if (!wsReady) return; // Wait until WebSocket is ready
    //
    //     console.log("Set audio stream to ", audioStream);
    //     // Ensure audioPub is called when audio is toggled
    //     if (isAudioOn && !audioStream) {
    //         audioPub(isAudioOn).then(() => {
    //             console.log("Changed Audio pub", audioStream?.getAudioTracks());
    //         });
    //     }
    // }, [isAudioOn, wsReady, audioStream]); // Add audioStream as a dependency
    //
    // useEffect(() => {
    //     if (!wsReady) return; // Wait until WebSocket is ready
    //
    //     console.log("Set video stream to ", videoStream);
    //     // Ensure videoPub is called when video is toggled
    //     if (isVideoOn && !videoStream) {
    //         videoPub(isVideoOn).then(() => {
    //             console.log("Changed isVideoOn pub", videoStream?.getVideoTracks());
    //         });
    //     }
    // }, [isVideoOn, wsReady, videoStream]); // Add videoStream as a dependency
    // 🔄 When mic changes, reinitialize audio stream
    useEffect(() => {
        if (!selectedMic || !isAudioOn || !audioStream) return;
        navigator.mediaDevices
            .getUserMedia({ audio: { deviceId: { exact: selectedMic } } })
            .then((stream) => {
                const track = stream.getAudioTracks()[0];
                if (audioStreamRef.current) {
                    // replace the old track in the existing sender
                    const sender = roomPcs.current.audio
                        ?.getSenders()
                        ?.find((s) => s.track?.kind === "audio");
                    sender?.replaceTrack(track);
                }
                setAudioStream(stream);
            })
            .catch(console.error);
    }, [selectedMic]);

// 🎥 When camera changes, reinitialize video stream
    useEffect(() => {
        if (!selectedCam || !isVideoOn || !videoStream) return;
        navigator.mediaDevices
            .getUserMedia({ video: { deviceId: { exact: selectedCam } } })
            .then((stream) => {
                const track = stream.getVideoTracks()[0];
                if (videoStreamRef.current) {
                    const sender = roomPcs.current.video
                        ?.getSenders()
                        ?.find((s) => s.track?.kind === "video");
                    sender?.replaceTrack(track);
                }
                setVideoStream(stream);
            })
            .catch(console.error);
    }, [selectedCam]);
    // 🔊 When speaker changes, redirect all meeting audio elements
    useEffect(() => {
        if (!selectedSpeaker) return;

        // Find all <audio> and <video> elements that play remote sound
        const mediaElements = document.querySelectorAll<HTMLMediaElement>('audio, video');

        mediaElements.forEach((el) => {
            if (typeof el.setSinkId === 'function') {
                el.setSinkId(selectedSpeaker)
                    .then(() => {
                        console.log(`Speaker changed for element -> ${selectedSpeaker}`);
                    })
                    .catch((err) => {
                        console.warn('Failed to set sinkId for element', err);
                    });
            } else {
                console.warn('setSinkId() is not supported in this browser.');
            }
        });
    }, [selectedSpeaker]);
    useEffect(() => {
        // GetRoomDetails(meeting).then((r => setMeetingDetails(r.response)))
        if (!wsReady) return;
        initializeMeeting();

        return () => {
            console.log("🧹 Cleaning up meeting...");
            // 1️⃣ Close WebSocket
            if (useWS.current) {
                useWS.current.onmessage = null;
                useWS.current.onopen = null;
                useWS.current.close();
            }
            setWsReady(false)

            // 2️⃣ Close RTCPeerConnections
            Object.values(roomPcs.current).forEach(pc => {
                try {
                    pc?.getSenders().forEach(s => s.track?.stop());
                    pc?.getReceivers().forEach(r => r.track?.stop());
                    pc?.close();
                } catch (err) {
                    console.warn("Error closing PC:", err);
                }
            });

            // 3️⃣ Stop all audio tracks
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                setAudioStream(null);
            }
            if (videoStream) {
                videoStream.getTracks().forEach(track => track.stop());
                setVideoStream(null);
            }
            // 4️⃣ Clear remote streams
            setViewers([]);
            setMeetingDetails(new webrtc.RoomCreateResponse());
            setRemoteStreams(new Map<number, userStreams>)
            setIsAudioOn(false)
            setIsVideoOn(false)
            setSelectedMic("")
            setSelectedSpeaker("")
            setSelectedCam("")
            candidateQueue.current = {
                audio: [],
                video: []
            };
            remoteDescriptionSet.current = {
                audio: false,
                video: false
            };
            // 5️⃣ Clear candidate roomPCs & queue & flags
            candidateQueue.current = { audio: [], video: [] };
            roomPcs.current.audio?.close();
            roomPcs.current.video?.close();

            roomPcs.current= {audio: undefined, video: undefined};

            remoteDescriptionSet.current = { audio: false, video: false };
            setTimeout(() => {

            }, 2000)
            // 6️⃣ Clear any scheduled timeouts
            // window.clearTimeout(audioTimeoutRef);
        };
    }, [wsReady, meeting]);

    return (
        <div className="flex flex-col w-full h-screen bg-background text-foreground text-white p-4">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-sm">Meeting</h2>
                    <h1 className="text-2xl font-semibold">
                        {meetingDetails?.title || meetingDetails.id}
                    </h1>
                    <h1 className="text-2xl font-semibold">{meetingDetails?.id}</h1>
                </div>

                {/* ⚙️ Settings Dialog Trigger */}
                <MeetingSettingsDialog
                    selectedMic={selectedMic}
                    selectedCam={selectedCam}
                    selectedSpeaker={selectedSpeaker}
                    setSelectedMic={setSelectedMic}
                    setSelectedSpeaker={setSelectedSpeaker}
                    setSelectedCam={setSelectedCam}
                    handleShare={handleShare}
                    handleInvite={handleInvite}
                    contacts={contacts}
                />
            </div>

            {/* Main Area */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className={`w-full`}>
                    <MeetingParticipantsSidebar
                        viewers={viewers}
                        remoteStreams={remoteStreams}
                        setMainViewer={setMainViewer}
                        mainViewer={mainViewer}
                        selfID={selfID}
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="sticky bottom-0 left-0 right-0 bg-background py-3 flex justify-center">
                <BottomControls
                    friendState={friendState}
                    isAudioOn={isAudioOn}
                    setIsAudioOn={setIsAudioOn}
                    isVideoOn={isVideoOn}
                    setIsVideoOn={setIsVideoOn}
                />
            </div>
            {viewers.find((v) => v.id === selfID) && (
                <motion.div
                    drag
                    dragMomentum={false}
                    dragConstraints={{
                        top: -1000,
                        bottom: 1000,
                        left: -1000,
                        right: 1000,
                    }}
                    className="fixed bottom-4 right-4 z-[1000] cursor-move"
                >
                    <ResizableBox
                        width={280}
                        height={160}
                        minConstraints={[180, 100]}
                        maxConstraints={[600, 400]}
                        resizeHandles={["se"]}
                        className="border-2 border-purple-500 rounded-xl overflow-hidden shadow-lg bg-[#111]"
                    >
                        <VideoTile
                            stream={{ video: videoStream, audio: audioStream }}
                            viewer={viewers.find((v) => v.id === selfID)!}
                        />
                    </ResizableBox>
                </motion.div>
            )}

        </div>
    );
    async function handleRoomOffer(message: any, kind: keyof typeof roomPcs.current) {
        const remoteDesc = new RTCSessionDescription({
            type: 'offer',
            sdp: message.sdp,
        });
        await roomPcs.current[kind]?.setRemoteDescription(remoteDesc);
        const answer = await roomPcs.current[kind]?.createAnswer();
        await roomPcs.current[kind]?.setLocalDescription(answer);
        await sendWsMessage(
            JSON.stringify({
                type: 'answer-' + kind,
                sdp: answer?.sdp,
                target_id: message.user.id,
                call_type: kind
            })
        );
        remoteDescriptionSet.current[kind] = true
        await processQueuedIceCandidates(kind);
    }
    async function processQueuedIceCandidates(type: keyof typeof roomPcs.current) {
        console.log(`Processing type ${type}`);
        for (const candidate of candidateQueue.current[type]) {
            try {
                await roomPcs.current[type]?.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error processing queued ICE candidate:", err);
            }
        }
        candidateQueue.current[type] = [];
    }
    async function handleIceCandidate_(message: { candidate: RTCIceCandidateInit | undefined; }, kind: keyof typeof roomPcs.current) {
        if (message.candidate) {
            console.log(`ice-candidate-${kind} msg`, message)
            const candidate = new RTCIceCandidate(message.candidate);
            if (remoteDescriptionSet.current[kind]) {
                try {
                    await roomPcs.current[kind]?.addIceCandidate(candidate);
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            } else {
                candidateQueue.current[kind].push(candidate);
            }
        }
    }


}
