// pages/friends.tsx
import {useEffect, useState} from "react";
import {AppSidebar} from "@/components/sidebar/app-sidebar.tsx";
import {SidebarInset, SidebarProvider} from "../components/ui/sidebar.tsx";
import {SiteHeader} from "../components/site-header.tsx";
import {Auth} from "../../wailsjs/go/models.ts";
import {FriendChat} from "@/components/friend-chat.tsx";
import {GetLoggedInUserData} from "../../wailsjs/go/main/App";
import {HomeComponent} from "@/components/home.tsx";
import {useOnlineContacts} from "@/components/hooks/useOnlineContacts.tsx";
import {MeetingComponent} from "@/components/meeting/meetingComponent";
export const iframeHeight = "800px"
export const description = "A sidebar with a header and a search form."
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  QrCode,
} from "lucide-react"

interface HomeProps {
    selfId: number
}
export default function Home({ selfId }: HomeProps) {
    const [selectedFriend, setSelectedFriend] = useState<Auth.Contact | null>(null)
    const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [meetingSettings, setMeetingSettings] = useState<{
        micId: string | null,
        camId: string | null,
        audioOn: boolean,
        videoOn: boolean
    } | null>(null)
    const [loggedInUser, setUser] = useState<Auth.User>(new Auth.User)
    const onlineContacts = useOnlineContacts();
    const changeSelectedFrined = (friend:Auth.Contact | null) => {
        setSelectedMeeting(null)
        setSelectedFriend(friend)
        console.log(selectedMeeting)
    }
    const changeSelectedMeeting = (
        meetingId: string | null,
        settings?: {
            micId: string | null,
            camId: string | null,
            audioOn: boolean,
            videoOn: boolean
        }
    ) => {
        if (selectedMeeting === null) {
            setSelectedMeeting(meetingId)
            setSelectedFriend(null)
            if (settings){
                setMeetingSettings(settings)
            }
            // 👇 Now you can also use settings for your WebRTC setup
            // if (meetingId && settings) {
            //     console.log("Joining meeting", meetingId, "with settings:", settings)
            //     // example: initialize media
            //     navigator.mediaDevices.getUserMedia({
            //         audio: settings.audioOn ? { deviceId: settings.micId ?? undefined } : false,
            //         video: settings.videoOn ? { deviceId: settings.camId ?? undefined } : false,
            //     }).then(stream => {
            //         console.log("Got stream:", stream)
            //         // attach to your WebRTC logic here
            //     }).catch(err => console.error("Error getting devices:", err))
            // }

        } else {
            console.error("Cannot switch between meetings.")
        }
    }

    useEffect(() => {
        const GetLoggedInUser = async () => {
            const loggedIn = await GetLoggedInUserData();
            console.log("GetLoggedInUser", loggedIn)
            console.log("GetOnlineContacts", onlineContacts)
            setUser(loggedIn);
        };

        GetLoggedInUser();
        // console.log("GetLoggedInUser", loggedInUser);
        // listen for login/logout events
        window.addEventListener("user", GetLoggedInUser);
        return () => {
            window.removeEventListener("user", GetLoggedInUser);
        };
    }, []);


    return (
        <div className="h-screen flex flex-col [--header-height:calc(--spacing(14))]">

            <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
              <DialogContent className="sm:max-w-md text-white border-none">
                <DialogHeader>
                  <DialogTitle>{loggedInUser ? `${loggedInUser.first_name}'s Gigatag` : "My Gigatag"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 space-y-4">
                  {/* Replace with your actual QR code logic/image */}
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100">
                  <QrCode size={200} className="text-black" />
                </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this code to quickly add friends.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <SidebarProvider className="flex flex-col flex-1 overflow-hidden">
                <SiteHeader />
                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar friendState={changeSelectedFrined} meetingState={changeSelectedMeeting} loggedInUser={loggedInUser} onlineContacts={onlineContacts} setIsQrModalOpen={setIsQrModalOpen} />
                    <SidebarInset className="flex-1 overflow-hidden">
                        <div className="flex h-full flex-col">
                            {selectedFriend ?
                                <FriendChat
                                    Friend={selectedFriend}
                                    selfId={selfId}
                                    selfImg={loggedInUser.user_image}
                                    online={onlineContacts?.includes(selectedFriend.user_id)}
                                />
                                : selectedMeeting ?
                                    <MeetingComponent friendState={changeSelectedFrined} meeting={selectedMeeting} meetingSettings={meetingSettings} /> :
                                    <HomeComponent/>
                                }
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}
