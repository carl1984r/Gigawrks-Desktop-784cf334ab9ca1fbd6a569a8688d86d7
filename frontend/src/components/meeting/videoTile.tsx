import { Avatar, AvatarImage } from "@/components/ui/avatar.tsx";
import { AvatarFallback } from "@radix-ui/react-avatar";
import type { viewer } from "@/components/utils/MeetingPeerConnection.tsx";
import type { userStreams } from "@/components/utils/remoteStreams.tsx";
import { Mic, MicOff, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IsLoggedIn } from "../../../wailsjs/go/main/App";

interface VideoTileProps {
    stream?: userStreams;
    viewer?: viewer;
}

export default function VideoTile({ stream, viewer }: VideoTileProps) {
    const [isSelf, setIsSelf] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [hovered, setHovered] = useState(false);
    const [maximized, setMaximized] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        IsLoggedIn().then((id) => setIsSelf(id === viewer?.id));
    }, [viewer]);

    // ✅ Only set srcObject when stream changes
    useEffect(() => {
        if (videoRef.current && stream?.video?.getVideoTracks()?.length) {
            videoRef.current.srcObject = new MediaStream(stream.video.getVideoTracks());
        }
    }, [stream?.video]);

    useEffect(() => {
        if (audioRef.current && stream?.audio?.getAudioTracks()?.length) {
            audioRef.current.srcObject = new MediaStream(stream.audio.getAudioTracks());
        }
    }, [stream?.audio]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted || isSelf;
            audioRef.current.volume = volume;
        }
    }, [isMuted, volume, isSelf]);

    const handleFullscreen = () => {
        setMaximized((prev) => {
          const newMaximizedState = !prev
          return newMaximizedState;
        });
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-xl border-2 aspect-video ${maximized ? "w-full h-full" : ""}
      ${viewer?.mic_enabled ? "border-purple-500" : "border-gray-700"}
      `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Video */}
            {stream?.video?.getVideoTracks()?.length ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover bg-secondary rounded-xl z-50"
                />
            ) : (
                <Avatar className="w-full h-full rounded-xl">
                    <AvatarImage src={viewer?.user_image || undefined} alt="avatar" />
                    <AvatarFallback className="rounded-lg w-full h-full text-center text-white text-lg">
                        {`${viewer?.first_name?.[0] || ""}${viewer?.last_name?.[0] || ""}`}
                    </AvatarFallback>
                </Avatar>
            )}

            {/* Audio */}
            <audio ref={audioRef} autoPlay playsInline muted={isMuted || isSelf} />

            {/* User Label */}
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-sm px-2 py-1 rounded-full">
                {isSelf ? "You" : `${viewer?.first_name} ${viewer?.last_name}`}
            </div>

            {/* Mic status */}
            <div className="absolute top-2 left-2 bg-purple-600 text-xs px-2 py-1 rounded-full">
                {stream?.audio?.getAudioTracks()?.length ? <Mic /> : <MicOff />}
            </div>

            {/* Hover Controls */}
            {hovered && !isSelf && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    {/* Volume Control */}
                    <div className="relative z-50">
                        <button
                            onClick={() => setIsMuted((prev) => !prev)}
                            className="bg-black/70 p-2 rounded-full hover:bg-black/90 transition relative z-50"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>

                        {/* Volume Slider */}
                        <div
                            className="absolute -top-28 right-0 flex flex-col items-center z-[9999]"
                            style={{ display: hovered ? "flex" : "none" }}
                        >
                            <div className="bg-black/80 p-2 rounded-xl">
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="w-24 rotate-[-90deg] origin-bottom accent-purple-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>



                    {/* Fullscreen Button */}
                    <button
                        onClick={handleFullscreen}
                        className="bg-black/70 p-2 rounded-full hover:bg-black/90 transition"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
