import {Mic, Video, Monitor, Users, Share2, Smile, MessageSquare, Phone, MicOff, VideoOff} from "lucide-react";
import { Button } from "@/components/ui/button";
import {Auth} from "../../../wailsjs/go/models.ts";
import { CopyToClipboard } from "../../../wailsjs/go/main/App";

interface iProps {
    friendState: (arg0: Auth.Contact | null) => void
    isAudioOn: boolean;
    setIsAudioOn: (isAudioOn: boolean) => void;
    isVideoOn: boolean;
    meetingDetails: string;
    setIsVideoOn: (isAudioOn: boolean) => void;
    screenPub: (enabled: boolean) => Promise<void>;
    screenShareEnabled: boolean;
}
export default function BottomControls({friendState, isAudioOn, setIsAudioOn, isVideoOn, meetingDetails, setIsVideoOn, screenPub, screenShareEnabled}: iProps) {

  const handleCopyLink = () => {
      const profileUrl = `https://gigawrks.com/room/${meetingDetails}`;

      // Use the native Go bridge instead of navigator.clipboard
      CopyToClipboard(profileUrl)
          .then(() => {
              // Success feedback
              console.log("Native macOS copy successful");
          })
          .catch((err) => {
              console.error("Native copy failed", err);
          });
  };

    return (
        <div className="flex items-center justify-center gap-4 bg-gray-900 rounded-full px-6 py-3">
            <Button variant="ghost" size="icon" className="rounded-full text-white" onClick={() => setIsVideoOn(!isVideoOn)}>
                {isVideoOn ? <Video className="w-5 h-5" />: <VideoOff className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white" onClick={() => setIsAudioOn(!isAudioOn)}>
                {isAudioOn ? <Mic className="w-5 h-5" />: <MicOff className="w-5 h-5" />}
            </Button>
            <Button
                variant="destructive"
                size="icon"
                className="rounded-full bg-red-600 hover:bg-red-700"
                onClick={() => friendState(null)}
            >
                <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white">
                <MessageSquare className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white">
                <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${screenShareEnabled ? 'text-blue-400 bg-slate-800' : 'text-white'}`}
              onClick={() => screenPub(!screenShareEnabled)}
            >
                <Monitor className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white">
                <Smile className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-white" onClick={() => handleCopyLink()}>
                <Share2 className="w-5 h-5" />
            </Button>
        </div>
    );
}
