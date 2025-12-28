import * as React from "react"
import {
  BookOpen, Bot, Command,
  LifeBuoy,
  Send, Settings2,
  SquareTerminal,
} from "lucide-react"

// import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {GetContacts} from "../../../wailsjs/go/main/App";
import {useEffect, useState} from "react";
import {Auth} from "../../../wailsjs/go/models.ts";
import {NavMeeting} from "@/components/sidebar/nav-meeting.tsx";
import {NavActivities} from "@/components/sidebar/nav-activities.tsx";
// import {NavMain} from "@/components/nav-main.tsx";
import NavContacts from "@/components/sidebar/nav-contacts.tsx";

const data = {

  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
}
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  friendState: (arg0: Auth.Contact | null) => void
  loggedInUser: Auth.User | undefined
  onlineContacts: number[]
  meetingState: (
      arg0: string | null,
      settings: {
        micId: string | null
        camId: string | null
        audioOn: boolean
        videoOn: boolean
      }
  ) => void
  setIsQrModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function AppSidebar({friendState, loggedInUser, onlineContacts, meetingState, setIsQrModalOpen, ...props }: AppSidebarProps) {

  const [contacts, setContacts] = useState<Auth.Contact[]>([])
  useEffect(() => {
    GetContacts({}).then(c => {
      console.log("contacts:", c)
      if (c) setContacts(c)
    })
  }, [])

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => friendState(null)} asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Gigawrks</span>
                  <span className="truncate text-xs">Home</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavContacts contacts={contacts} onlineContacts={onlineContacts} friendState={friendState} />
        {/*<NavMain items={data.navMain} />*/}
        <NavActivities meetingState={meetingState}/>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavMeeting meetingState={meetingState}/>
        <NavUser user={loggedInUser} setIsQrModalOpen={setIsQrModalOpen} />
      </SidebarFooter>
    </Sidebar>
  )
}
