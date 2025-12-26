import {
  // Folder,
  // MoreHorizontal,
  // Share,
  // Trash2,
  Podcast,
  type LucideIcon, ChevronRight, Group,
} from "lucide-react"

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  // useSidebar,
} from "@/components/ui/sidebar"
import {useEffect, useState} from "react";
import {GetMyRooms} from "../../../wailsjs/go/main/App";
import {webrtc} from "../../../wailsjs/go/models.ts";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {MeetingJoinDialog} from "@/components/meeting/MeetingJoinDialog.tsx";

interface typeActivites{
  name: string
  url: string
  type?: string
  icon: LucideIcon
}
interface NavActivities {
  meetingState: (roomId: string, settings: {
    micId: string | null,
    camId: string | null,
    audioOn: boolean,
    videoOn: boolean
  }) => void
}

export function NavActivities({meetingState}: NavActivities) {
  const [rooms, setRooms] = useState<webrtc.RoomCreateResponse[]>()
  const [activities, setActivities] = useState<typeActivites[]>()
  const [refreshActivities, setRefreshActivities] = useState<boolean>(false)
  // const { isMobile } = useSidebar()
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const handleOpenMeeting = (meetingId: string) => {
    setSelectedMeeting(meetingId);
    setShowJoinDialog(true);
  };

  const handleJoinMeeting = (settings: {
    micId: string | null;
    camId: string | null;
    audioOn: boolean;
    videoOn: boolean;
  }) => {
    setShowJoinDialog(false)
    if (selectedMeeting) {
      meetingState(selectedMeeting, settings)
  }};

  useEffect(() => {
    console.log("refreshActivities", refreshActivities)
    GetMyRooms().then(
        (r) => {
          console.log("response of activites ", r.response)
          if (r.status_code == 200) setRooms(r.response)
        }
    )
  }, [refreshActivities]);

  useEffect(() => {
    console.log("rooms", rooms)
    let act: typeActivites[] = []
    rooms?.forEach((room) =>{
      let activity: typeActivites = {
        name: room.title,
        url: room.id,
        type: "room",
        icon: Podcast,
      }
      act.push(activity)
    })
    setActivities(act)
    console.log("activities", activities)
  }, [rooms]);

  return (
      <>
    <SidebarGroup>
      {/*<SidebarGroupLabel>Activities</SidebarGroupLabel>*/}
      <SidebarMenu>
        <Collapsible key={"Activities"} asChild defaultOpen={true}>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={"Contacts"} >
              <div onClick={()=> setRefreshActivities(!refreshActivities)}>
                <Group />
                <span>Activities</span>
              </div>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {activities?.map((item) => (
                <SidebarMenu key={item.url}>
                  <SidebarMenuItem onClick={() => handleOpenMeeting(item.url)}>
                    <SidebarMenuButton asChild>
                      <div>
                        <item.icon />
                        <span>{item.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              ))}
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

      </SidebarMenu>
    </SidebarGroup>
      {/* 💬 Meeting Join Dialog */}
      <MeetingJoinDialog
        open={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onJoin={handleJoinMeeting}
      />

    </>
  );

}
