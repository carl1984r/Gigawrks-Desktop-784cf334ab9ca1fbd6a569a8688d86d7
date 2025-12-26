import {useEffect, useState} from "react"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Video } from "lucide-react"
import { Avatar } from "@radix-ui/react-avatar"
import { motion } from "framer-motion"
import { CreateMeetingRoom, GetRoomDetails } from "../../../wailsjs/go/main/App"
import { MeetingJoinDialog } from "@/components/meeting/MeetingJoinDialog.tsx"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
} from "@/components/ui/alert-dialog"

interface NavMeeting {
    meetingState: (
        arg0: string | null,
        settings: {
            micId: string | null
            camId: string | null
            audioOn: boolean
            videoOn: boolean
        }
    ) => void
}

export function NavMeeting({ meetingState }: NavMeeting) {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState<"create" | "join">("create")

    const [form, setForm] = useState({
        code_required: false,
        invitation_required: false,
        waiting_room_required: false,
        title: "",
        peers_limit: 20,
    })
    const [errors, setErrors] = useState<{ title?: string; peers_limit?: string }>({})
    const [meetingId, setMeetingId] = useState("")
    const [meetingIdError, setMeetingIdError] = useState("")
    const [showJoinDialog, setShowJoinDialog] = useState(false)
    const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null)
    const [alert, setAlert] = useState<{ open: boolean; message: string }>({
        open: false,
        message: "",
    })

    const [meetingInfo, setMeetingInfo] = useState<any | null>(null)
    const [loadingMeeting, setLoadingMeeting] = useState(false)

    const validateUUID = (uuid: string) => {
        return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)
    }

    useEffect(() => {
        const fetchMeeting = async () => {
            const trimmed = meetingId.trim()
            if (!validateUUID(trimmed)) {
                setMeetingIdError("Invalid Room ID")
                setMeetingInfo(null)
                return
            }

            setMeetingIdError("")
            setLoadingMeeting(true)
            try {
                const response = await GetRoomDetails(trimmed)
                if (response.status_code === 200) setMeetingInfo(response.response)
                if (response.status_code >= 400){
                    setMeetingIdError(response?.error)
                    // setAlert({
                    //     open: true,
                    //     message: response?.error || "Unexpected error while creating a room.",
                    // })
                    console.log("Error creating meeting:", response)
                }
            } catch (e) {
                setMeetingInfo(null)
                setMeetingIdError("Error fetching room info")
            } finally {
                setLoadingMeeting(false)
            }
        }

        if (meetingId.trim()) fetchMeeting()
        else {
            setMeetingInfo(null)
            setMeetingIdError("")
        }
    }, [meetingId])
    const validateLive = (updatedForm: typeof form) => {
        const newErrors: { title?: string; peers_limit?: string } = {}
        const nameRegex = /^[a-zA-Z0-9\-]+$/

        if (!updatedForm.title.trim()) {
            newErrors.title = "Room title is required"
        } else if (!nameRegex.test(updatedForm.title.trim())) {
            newErrors.title = "Only alphanumeric characters and '-' are allowed"
        }

        if (updatedForm.peers_limit < 3 || updatedForm.peers_limit > 99) {
            newErrors.peers_limit = "Participants must be between 3 and 99"
        }

        setErrors(newErrors)
    }

    const handleChange = (field: string, value: any) => {
        setForm((prev) => {
            const updatedForm = { ...prev, [field]: value }
            validateLive(updatedForm)
            return updatedForm
        })
    }

    const handleTitleChange = (value: string) => {
        // Replace spaces with '-' while typing
        const formatted = value.replace(/\s+/g, "-")
        handleChange("title", formatted)
    }

    const validateForm = () => {
        const newErrors: { title?: string; peers_limit?: string } = {}
        const nameRegex = /^[a-zA-Z0-9\-]+$/

        if (!form.title.trim()) {
            newErrors.title = "Room title is required"
        } else if (!nameRegex.test(form.title.trim())) {
            newErrors.title = "Only alphanumeric characters and '-' are allowed"
        }

        if (form.peers_limit < 3 || form.peers_limit > 99) {
            newErrors.peers_limit = "Participants must be between 3 and 99"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCreateMeeting = async () => {
        if (!validateForm()) return

        try {
            const response = await CreateMeetingRoom(
                form.title,
                form.invitation_required,
                form.code_required,
                form.waiting_room_required,
                form.peers_limit
            )

            if (response?.status_code === 400) {
                setAlert({
                    open: true,
                    message: response?.error || "Unexpected error while creating a room.",
                })
                console.log("Error creating meeting:", response)
                return
            }

            console.log("Created meeting:", response)
            setOpen(false)
        } catch {
            setAlert({
                open: true,
                message: "Unexpected error while creating a room.",
            })
        }
    }


    const handleOpenMeeting = (meetingId: string) => {
        if (!validateUUID(meetingId.trim())) {
            setMeetingIdError("Room not found")
            return
        }
        setMeetingIdError("")
        setSelectedMeeting(meetingId)
        setShowJoinDialog(true)
    }

    const handleJoinMeeting = (settings: {
        micId: string | null
        camId: string | null
        audioOn: boolean
        videoOn: boolean
    }) => {
        setShowJoinDialog(false)
        setOpen(false)
        if (selectedMeeting) meetingState(selectedMeeting, settings)
    }

    return (
        <>
            {/* Sidebar Button */}
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                onClick={() => setOpen(true)}
                                className="flex items-center gap-3 rounded-xl bg-sidebar-accent/10 hover:bg-sidebar-accent/20 transition-colors"
                            >
                                <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-500 to-teal-400 flex items-center justify-center">
                                    <Video className="h-5 w-5 text-white" />
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium text-sidebar-foreground">
                                        New Meeting
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        audio only
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            {/* Main Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[440px] rounded-2xl border border-border/40 bg-card text-card-foreground shadow-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-foreground">
                                Meeting Options
                            </DialogTitle>
                        </DialogHeader>

                        <Tabs
                            value={tab}
                            onValueChange={(val) => setTab(val as "create" | "join")}
                            className="mt-3"
                        >
                            <TabsList className="grid grid-cols-2 w-full mb-4">
                                <TabsTrigger value="create">Create</TabsTrigger>
                                <TabsTrigger value="join">Join</TabsTrigger>
                            </TabsList>

                            {/* CREATE TAB */}
                            <TabsContent value="create" className="space-y-5">
                                {[
                                    {
                                        id: "code_required",
                                        label: "Require Code",
                                        field: "code_required",
                                    },
                                    {
                                        id: "invitation_required",
                                        label: "Invitation Required",
                                        field: "invitation_required",
                                    },
                                    {
                                        id: "waiting_room_required",
                                        label: "Waiting Room Required",
                                        field: "waiting_room_required",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border border-border/30 p-3 hover:bg-muted/10 transition"
                                    >
                                        <Label htmlFor={item.id}>{item.label}</Label>
                                        <Switch
                                            id={item.id}
                                            checked={form[item.field as keyof typeof form] as boolean}
                                            onCheckedChange={(checked) =>
                                                handleChange(item.field, checked)
                                            }
                                        />
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <Label htmlFor="title">Room Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter a room title..."
                                        value={form.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-red-500">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="peers_limit">Max Participants</Label>
                                    <Input
                                        id="peers_limit"
                                        type="number"
                                        min={3}
                                        max={99}
                                        placeholder="3 - 99"
                                        value={form.peers_limit}
                                        onChange={(e) =>
                                            handleChange("peers_limit", parseInt(e.target.value))
                                        }
                                    />
                                    {errors.peers_limit && (
                                        <p className="text-xs text-red-500">{errors.peers_limit}</p>
                                    )}
                                </div>
                            </TabsContent>

                            {/* JOIN TAB */}
                            {/* JOIN TAB */}
                            <TabsContent value="join" className="space-y-4">
                                <Label htmlFor="meetingId">Meeting ID</Label>

                                {/* Room details display */}
                                {loadingMeeting && (
                                    <p className="text-sm text-muted-foreground">Checking room...</p>
                                )}

                                {meetingInfo && (
                                    <div className="rounded-lg border border-border/40 p-3 bg-muted/5 space-y-2 text-sm animate-in fade-in">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-foreground">Title:</span>
                                            <span>{meetingInfo.title}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-foreground">Host:</span>
                                            <span>
          {meetingInfo.owner_user?.first_name} {meetingInfo.owner_user?.last_name}
        </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-foreground">Participants:</span>
                                            <span>
          {meetingInfo.live_peers}/{meetingInfo.max_peers}
        </span>
                                        </div>
                                        <div className="flex flex-col gap-1 pt-1 text-xs text-muted-foreground">
                                            {meetingInfo.code_required && <span>🔒 Code required</span>}
                                            {meetingInfo.invitation_required && <span>📩 Invitation required</span>}
                                            {meetingInfo.waiting_room_required && <span>⏳ Waiting room enabled</span>}
                                        </div>
                                    </div>
                                )}

                                <Input
                                    id="meetingId"
                                    placeholder="Enter meeting ID..."
                                    value={meetingId}
                                    onChange={(e) => setMeetingId(e.target.value.trim())}
                                />

                                {meetingIdError && (
                                    <p className="text-xs text-red-500">{meetingIdError}</p>
                                )}
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            {tab === "create" ? (
                                <Button
                                    onClick={handleCreateMeeting}
                                    disabled={
                                        Object.keys(errors).length > 0 ||
                                        !form.title.trim() ||
                                        form.peers_limit < 3 ||
                                        form.peers_limit > 99
                                    }
                                    className="rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white disabled:opacity-50"
                                >
                                    Create
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleOpenMeeting(meetingId)}
                                    disabled={!meetingInfo || !!meetingIdError}
                                    className="rounded-lg bg-gradient-to-r from-blue-500 to-teal-400 text-white disabled:opacity-50"
                                >
                                    Join
                                </Button>

                            )}
                        </DialogFooter>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Alert for error messages */}
            <AlertDialog open={alert.open} onOpenChange={(v) => setAlert({ ...alert, open: v })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Error</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p>{alert.message}</p>
                    <AlertDialogFooter>
                        <Button onClick={() => setAlert({ open: false, message: "" })}>
                            OK
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Join settings dialog */}
            <MeetingJoinDialog
                open={showJoinDialog}
                onClose={() => setShowJoinDialog(false)}
                onJoin={handleJoinMeeting}
            />
        </>
    )
}
