import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface MeetingSettingsDialogProps {
    selectedMic: string;
    selectedCam: string;
    selectedSpeaker: string;
    setSelectedMic: (id: string) => void;
    setSelectedCam: (id: string) => void;
    setSelectedSpeaker: (id: string) => void;
    handleShare: () => void;
    handleInvite: (tag: string) => void;
    contacts: { id: string; name: string; tag: string }[];
}

export default function MeetingSettingsDialog({
                                                  selectedMic,
                                                  selectedCam,
                                                  selectedSpeaker,
                                                  setSelectedMic,
                                                  setSelectedCam,
                                                  setSelectedSpeaker,
                                                  handleShare,
                                                  handleInvite,
                                                  contacts,
                                              }: MeetingSettingsDialogProps) {
    const [devices, setDevices] = useState<{
        mics: MediaDeviceInfo[];
        cams: MediaDeviceInfo[];
        speakers: MediaDeviceInfo[];
    }>({
        mics: [],
        cams: [],
        speakers: [],
    });
    const [inviteMode, setInviteMode] = useState<"list" | "manual">("list");
    const [inviteTag, setInviteTag] = useState("");

    // Fetch all devices on mount
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((list) => {
            setDevices({
                mics: list.filter((d) => d.kind === "audioinput"),
                cams: list.filter((d) => d.kind === "videoinput"),
                speakers: list.filter((d) => d.kind === "audiooutput"),
            });
        });
    }, []);

    // When changing speakers
    const handleSpeakerChange = async (deviceId: string) => {
        setSelectedSpeaker(deviceId);

        // Try to set sinkId on an <audio> element if supported
        const testAudio = document.querySelector("audio#meeting-audio") as HTMLAudioElement | null;
        if (testAudio && "setSinkId" in testAudio) {
            try {
                // @ts-ignore
                await testAudio.setSinkId(deviceId);
                console.log(`✅ Speaker changed to deviceId: ${deviceId}`);
            } catch (err) {
                console.error("Error setting sinkId:", err);
                alert("Could not change speaker output.");
            }
        } else {
            console.warn("setSinkId is not supported in this browser.");
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground rounded-full hover:bg-foreground hover:text-background"
                >
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-background text-foreground border-secondary max-w-md">
                <DialogHeader>
                    <DialogTitle>Meeting Settings</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    {/* Microphone */}
                    <div>
                        <label className="text-sm font-medium">Microphone</label>
                        <select
                            value={selectedMic}
                            onChange={(e) => setSelectedMic(e.target.value)}
                            className="mt-1 w-full bg-background text-foreground border border-secondary rounded-md p-2 text-sm"
                        >
                            {devices.mics.map((mic) => (
                                <option key={mic.deviceId} value={mic.deviceId}>
                                    {mic.label || "Unnamed Microphone"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Camera */}
                    <div>
                        <label className="text-sm font-medium">Camera</label>
                        <select
                            value={selectedCam}
                            onChange={(e) => setSelectedCam(e.target.value)}
                            className="mt-1 w-full bg-background text-foreground border border-secondary rounded-md p-2 text-sm"
                        >
                            {devices.cams.map((cam) => (
                                <option key={cam.deviceId} value={cam.deviceId}>
                                    {cam.label || "Unnamed Camera"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speaker */}
                    <div>
                        <label className="text-sm font-medium">Speaker</label>
                        <select
                            value={selectedSpeaker}
                            onChange={(e) => handleSpeakerChange(e.target.value)}
                            className="mt-1 w-full bg-background text-foreground border border-secondary rounded-md p-2 text-sm"
                        >
                            {devices.speakers.map((spk) => (
                                <option key={spk.deviceId} value={spk.deviceId}>
                                    {spk.label || "Unnamed Speaker"}
                                </option>
                            ))}
                        </select>
                        {/*<p className="text-xs text-gray-400 mt-1">*/}
                        {/*    (Speaker selection works best in Chrome)*/}
                        {/*</p>*/}
                    </div>

                    {/* Share Button */}
                    <Button
                        onClick={handleShare}
                        className="bg-primary text-secondary border border-secondary hover:bg-purple-700 w-full mt-2"
                    >
                        Share Meeting Link
                    </Button>

                    {/* Invite Section */}
                    <div className="mt-4">
                        <label className="text-sm font-medium mb-2 block">
                            Invite Participants
                        </label>

                        <div className="flex gap-2 mb-2">
                            <Button
                                variant={inviteMode === "list" ? "default" : "outline"}
                                onClick={() => setInviteMode("list")}
                            >
                                My Contacts
                            </Button>
                            <Button
                                variant={inviteMode === "manual" ? "default" : "outline"}
                                onClick={() => setInviteMode("manual")}
                            >
                                Enter Tag
                            </Button>
                        </div>

                        {inviteMode === "list" ? (
                            <div className="max-h-40 overflow-y-auto bg-zinc-800 rounded-lg p-2">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center justify-between py-2 px-3 hover:bg-zinc-700 rounded-md cursor-pointer"
                                        onClick={() => handleInvite(contact.tag)}
                                    >
                                        <span>{contact.name}</span>
                                        <span className="text-sm text-gray-400">
                                            {contact.tag}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteTag}
                                    onChange={(e) => setInviteTag(e.target.value)}
                                    placeholder="@username"
                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md p-2 text-sm"
                                />
                                <Button
                                    onClick={() => handleInvite(inviteTag)}
                                    disabled={!inviteTag}
                                    className="bg-purple-600 hover:bg-purple-700"
                                >
                                    Invite
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
