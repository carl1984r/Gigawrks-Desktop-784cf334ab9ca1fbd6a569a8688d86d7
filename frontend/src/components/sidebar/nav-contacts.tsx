import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar.tsx";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {ChevronRight, Users} from "lucide-react";
import {NavFriend} from "@/components/sidebar/nav-friend.tsx";
import {Auth} from "../../../wailsjs/go/models.ts";
interface NavContactsProps  {
    contacts?: Auth.Contact[]
    friendState: (arg0: Auth.Contact | null) => void
    // friendsState: React.Dispatch<React.SetStateAction<Auth.Contact | null>>
    onlineContacts: number[]
}
export default function NavContacts({contacts, onlineContacts, friendState}: NavContactsProps) {
    return(
        <SidebarGroup>
            {/*<SidebarGroupLabel>Friends</SidebarGroupLabel>*/}
            <SidebarMenu>
                <Collapsible key={"Contacts"} asChild defaultOpen={true}>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={"Contacts"}>
                            <div onClick={()=> friendState(null)}>
                                <Users/>
                                <span>Contacts</span>
                            </div>
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuAction className="data-[state=open]:rotate-90">
                                <ChevronRight />
                                <span className="sr-only">Toggle</span>
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {/*<SidebarMenuSub>*/}
                            {contacts?.map((user, idx) => (
                                <NavFriend key={user.id ?? idx}
                                           user={user}
                                           isOnline={onlineContacts?.includes(user.user_id)} // ✅ check if online
                                           onClick={() => {
                                               console.log("click user", user)
                                               friendState(user)
                                           }} />
                            ))}
                            {/*</SidebarMenuSub>*/}
                        </CollapsibleContent>
                    </SidebarMenuItem>
                </Collapsible>

            </SidebarMenu>
        </SidebarGroup>
    )
}