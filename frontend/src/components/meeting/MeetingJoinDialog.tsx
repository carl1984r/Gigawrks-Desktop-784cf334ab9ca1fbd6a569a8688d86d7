import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MeetingJoinDialogProps {
    open: boolean;
    onClose: () => void;
    onJoin: (options: {
        micId: string | null;
        camId: string | null;
        audioOn: boolean;
        videoOn: boolean;
    }) => void;
}
async function getMediaDevicesWithPermission() {
    try {
        // Ask for permission for both audio and video once
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true});
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

        // After permission is granted, enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();

        // Stop tracks immediately (we only needed them to unlock labels)
        stream.getTracks().forEach(track => track.stop());
        videoStream.getTracks().forEach(track => track.stop());
        const mics = devices.filter(d => d.kind === "audioinput");
        const cams = devices.filter(d => d.kind === "videoinput");

        return { mics, cams };
    } catch (err) {
        console.error("User denied permissions or error accessing media devices:", err);
        return { mics: [], cams: [] };
    }
}

export function MeetingJoinDialog({ open, onClose, onJoin }: MeetingJoinDialogProps) {
    const [devices, setDevices] = useState<{ mics: MediaDeviceInfo[]; cams: MediaDeviceInfo[] }>({
        mics: [],
        cams: [],
    });
    const [selectedMic, setSelectedMic] = useState<string | null>(null);
    const [selectedCam, setSelectedCam] = useState<string | null>(null);
    const [audioOn, setAudioOn] = useState(false);
    const [videoOn, setVideoOn] = useState(false);

    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [audioTestMuted, setAudioTestMuted] = useState<boolean>(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const toggleVideo = async () =>{
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        videoStream.getTracks().forEach(track => track.stop());

        const mics = devices.filter(d => d.kind === "audioinput");
        const cams = devices.filter(d => d.kind === "videoinput");

        return { mics, cams };
    }
    useEffect(() => {
        if (!open) {
            setAudioOn(false);
            setVideoOn(false);
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
            if (audioStream) audioStream.getTracks().forEach(track => track.stop());
            return;
        }

        const updateDevices = async () => {
            // Ask permission only if labels are empty (no prior permission)
            let devicesList = await navigator.mediaDevices.enumerateDevices();

            // If labels are hidden, request access
            if (devicesList.some(d => !d.label)) {
                const { mics, cams } = await getMediaDevicesWithPermission();
                setDevices({ mics, cams });
                setSelectedMic(mics[0]?.deviceId || null);
                setSelectedCam(cams[0]?.deviceId || null);
                setAudioOn(mics.length > 0);
            } else {
                const mics = devicesList.filter(d => d.kind === "audioinput");
                const cams = devicesList.filter(d => d.kind === "videoinput");
                setDevices({ mics, cams });
                setSelectedMic(mics[0]?.deviceId || null);
                setSelectedCam(cams[0]?.deviceId || null);
                setAudioOn(mics.length > 0);
            }
            setVideoOn(false);
        };

        updateDevices();
        navigator.mediaDevices.addEventListener("devicechange", updateDevices);
        return () => navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
    }, [open]);
    useEffect(() => {
        if (!videoOn) return;
        try {
            toggleVideo()
        } catch (err) {
            console.error("User denied permissions or error accessing media devices:", err);
        }

    }, [videoOn]);
    // 🎤 Load device list and reset states each time dialog opens
    // useEffect(() => {
    //     if (!open) return;
    //
    //     const updateDevices = async () => {
    //         const list = await navigator.mediaDevices.enumerateDevices();
    //         const mics = list.filter((d) => d.kind === "audioinput");
    //         const cams = list.filter((d) => d.kind === "videoinput");
    //
    //         setDevices({ mics, cams });
    //
    //         // Reset selections
    //         setSelectedMic(mics.length ? mics[0].deviceId : null);
    //         setSelectedCam(cams.length ? cams[0].deviceId : null);
    //
    //         // Mic on if available, camera always off initially
    //         setAudioOn(mics.length > 0);
    //         setVideoOn(false);
    //     };
    //
    //     updateDevices();
    //     navigator.mediaDevices.addEventListener("devicechange", updateDevices);
    //     return () => navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
    // }, [open]);

    // 🎥 Handle video and audio preview
    useEffect(() => {
        if (!open) {
            setAudioOn(false);
            setVideoOn(false);
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
            if (audioStream) audioStream.getTracks().forEach(track => track.stop());
            return;
        }

        const updateVideoPreview = async () => {
            if (videoOn && selectedCam) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedCam } });
                    setVideoStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing video:", err);
                    setVideoOn(false);
                }
            } else {
                if (videoStream) {
                    videoStream.getTracks().forEach(track => track.stop());
                    setVideoStream(null);
                }
            }
        };

        const updateAudioPreview = async () => {
            if (audioOn && selectedMic) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedMic } });
                    setAudioStream(stream);
                    if (audioRef.current) {
                        audioRef.current.srcObject = stream;
                    }

                    const audioContext = new AudioContext();
                    const source = audioContext.createMediaStreamSource(stream);
                    const analyser = audioContext.createAnalyser();
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    source.connect(analyser);

                    const updateMeter = () => {
                        analyser.getByteFrequencyData(dataArray);
                        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                        setAudioLevel(average);
                        requestAnimationFrame(updateMeter);
                    };
                    updateMeter();

                } catch (err) {
                    console.error("Error accessing mic:", err);
                    setAudioOn(false);
                }
            } else {
                if (audioStream) {
                    audioStream.getTracks().forEach(track => track.stop());
                    setAudioStream(null);
                }
            }
        };

        updateVideoPreview();
        updateAudioPreview();

        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
            if (audioStream) audioStream.getTracks().forEach(track => track.stop());
        };
    }, [videoOn, audioOn, selectedMic, selectedCam, open]);

    const handleJoin = () => {
        onJoin({ micId: selectedMic, camId: selectedCam, audioOn, videoOn });
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md">
                <DialogHeader>
                    <DialogTitle>Join Meeting</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Microphone Selector */}
                    <div>
                        <label className="text-sm font-medium">Microphone</label>
                        <select
                            value={selectedMic ?? ""}
                            onChange={(e) => setSelectedMic(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm"
                            disabled={devices.mics.length === 0}
                        >
                            {devices.mics.map((mic) => (
                                <option key={mic.deviceId} value={mic.deviceId}>
                                    {mic.label || "Unnamed Microphone"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Camera Selector */}
                    <div>
                        <label className="text-sm font-medium">Camera</label>
                        <select
                            value={selectedCam ?? ""}
                            onChange={(e) => setSelectedCam(e.target.value)}
                            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm"
                            disabled={devices.cams.length === 0}
                        >
                            {devices.cams.map((cam) => (
                                <option key={cam.deviceId} value={cam.deviceId}>
                                    {cam.label || "Unnamed Camera"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Audio / Video Toggles */}
                    <div className="flex justify-between items-center mt-4">
                        <Button
                            variant={audioOn ? "default" : "outline"}
                            onClick={() => setAudioOn(!audioOn)}
                            className="w-32"
                            disabled={devices.mics.length === 0}
                        >
                            {audioOn ? "🎤 Mic On" : "🔇 Mic Off"}
                        </Button>
                        <Button
                            variant={videoOn ? "default" : "outline"}
                            onClick={() => setVideoOn(!videoOn)}
                            className="w-32"
                            disabled={devices.cams.length === 0}
                        >
                            {videoOn ? "📹 Cam On" : "📷 Cam Off"}
                        </Button>

                    </div>

                    {/* Audio Preview + Test Bar */}
                    {audioOn && (
                        <div className="mt-2">
                            <audio ref={audioRef} autoPlay muted={audioTestMuted} />
                            <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-zinc-700 rounded">
                                    <div
                                        className="h-full bg-green-500 transition-all"
                                        style={{ width: `${Math.min(audioLevel, 100)}%` }}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (audioStream) {
                                            audioStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
                                            setAudioTestMuted(!audioTestMuted);
                                        }
                                    }}
                                    className="text-xs w-20"
                                >
                                    {audioTestMuted ? "Unmute" : "Mute"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Video Preview */}
                    {videoOn && (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full mt-4 rounded-md border border-zinc-700"
                        />
                    )}
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleJoin} className="bg-purple-600 hover:bg-purple-700">
                        Join Meeting
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
