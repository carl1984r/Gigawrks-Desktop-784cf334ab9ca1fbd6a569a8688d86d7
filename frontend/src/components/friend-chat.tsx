import {Auth, chat} from "../../wailsjs/go/models.ts";
import {Avatar, AvatarImage} from "@/components/ui/avatar.tsx";
import {AvatarFallback} from "@radix-ui/react-avatar";
import { Button } from "./ui/button.tsx";
import {MoreHorizontal, Phone, Search, User, Video,
    Copy,
    Reply,
    Edit,
    Forward,
    Trash2} from "lucide-react";
import {useEffect, useRef, useState, type Dispatch, type SetStateAction} from "react";
import {EventsOn} from "../../wailsjs/runtime";
import {SendChatReadWsMsg, SendOnlineWsMsg} from "../../wailsjs/go/main/App";
import {ChatInputBar} from "@/components/chat-input.tsx";
import OnlineWsMessage = chat.OnlineWsMessage;
import OnlineWsFile = chat.File;
import {FilePreview} from "@/components/file-preview.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import MessageError from "@/components/utils/messageError.tsx";
interface FriendChatProps {
    Friend: Auth.Contact,
    selfId?: number,
    selfImg?: string,
    online?: boolean,
    ws?: WebSocket
}


interface ChatMessage {
    id: number
    uuid: string
    created_by_id: number
    from: number
    to: number
    err: string
    content: string
    content_type: string
    created_at: string
    updated_at?: string
    status?: number // 1..6
    media: { url: string; type: string; name: string }[]
}
import { Check, CheckCheck } from "lucide-react";

function formatTime(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// 1=sent,2=delivered,3=read,4=edited+sent,5=edited+delivered,6=edited+read
function getEffectiveStatus(status?: number) {
    if (!status) return 1;
    return ((status - 1) % 3) + 1; // 4->1, 5->2, 6->3
}

function isEditedStatus(status?: number) {
    return (status ?? 0) >= 4;
}

function StatusTicks({ status }: { status?: number }) {
    const effective = getEffectiveStatus(status);

    if (effective === 1) return <Check className="h-3 w-3" />;
    if (effective === 2) return <CheckCheck className="h-3 w-3" />;
    // read
    return <CheckCheck className="h-3 w-3 text-blue-500" />;
}


export function FriendChat(Friend: FriendChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [popupImage, setPopupImage] = useState<string | null>(null);
    // const [isOnline, setIsOnline] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // const scrollToBottom = () => {
    //     messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    // };

    useEffect(() => {
        SendChatReadWsMsg(Friend.Friend?.user_id || 0).then(r => console.log(r));
        const off = EventsOn("chat_read", (msg) => {
            console.log("Chat read event:", msg);

            // Example: update state with incoming messages
            // setMessages((prev) => [...prev, ...msg.messages]);
            setMessages(msg.messages);
        });
        // cleanup listener on unmount
        return () => {
            off();
        };
    }, [Friend]);

    useEffect(() => {
        // SendChatReadWsMsg(Friend.Friend?.user_id || 0).then(r => console.log(r));
        const off = EventsOn("chat_message", (msg) => {
            console.log("chat_message event:", msg);
            if (msg.err && msg.err !== ""){
                msg.message.err = msg.err
            }
            console.log("chat_message event:", msg.message.err);
            // Example: update state with incoming messages
            setMessages((prev) => [...prev, msg.message]);
            console.log("messages updates", messages)
        });
        // console.log(messages)
        // cleanup listener on unmount
        return () => {
            off();
        };
    }, [Friend]);
    useEffect(() => {
        // SendChatReadWsMsg(Friend.Friend?.user_id || 0).then(r => console.log(r));
        const off = EventsOn("chat_message_delete", (msg) => {
            console.log("chat_message_delete event msg.messages:", msg.messages);
            if (msg.err && msg.err !== ""){
                msg.message.err = msg.err
            }
            console.log("chat_message_delete event:", msg);
            // Example: update state with incoming messages
            if (msg?.messages?.length > 0){
                setMessages((prev) => {
                    // filter out the deleted message by UUID
                    const updated = prev.filter((m) => m.uuid !== msg?.messages[0]?.uuid);
                    console.log("chat_message_delete removed:", msg?.messages[0]?.uuid);
                    return updated;
                });
            }

            console.log("chat_message_delete updates", messages)
        });
        // console.log(messages)
        // cleanup listener on unmount
        return () => {
            off();
        };
    }, [Friend]);
    // useEffect(() => {
    //     const container = messagesEndRef.current?.parentElement;
    //     if (container) container.scrollTo({ top: 0, behavior: "smooth" });
    // }, [messages]);
    function handleMessageAction(action: string, msg: any) {
        console.log(`Action: ${action}`, msg);
        // setContextMenu(null);

        switch (action) {
            case "copy":
                navigator.clipboard.writeText(msg.content || "");
                break;
            case "reply":
                // Trigger your reply logic here
                break;
            case "edit":
                // Trigger edit mode
                break;
            case "delete":
                { const wsMsg = new OnlineWsMessage
                wsMsg.type = 'chat_message_delete'
                wsMsg.uuid = msg.uuid
                wsMsg.target_id = Friend?.Friend.user_id
                SendOnlineWsMsg(
                    wsMsg
                ).then(r => console.log(r))
                break; }
            case "forward":
                // Open forward modal or action
                break;
            default:
                break;
        }
    }
    const sendTextMsg = (message: string) => {
        const msg = new OnlineWsMessage
        msg.type = 'chat_message'
        msg.content = message
        msg.content_type = "text"
        msg.uuid = crypto.randomUUID()
        msg.target_id = Friend?.Friend.user_id
        SendOnlineWsMsg(
            msg
        ).then(r => console.log(r))
    }
    // Function to send file
    const sendFiles = (message: string, files: File[], setMessage: Dispatch<SetStateAction<string>> | undefined) => {
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target?.result;
                const wsFile = new OnlineWsFile
                if (typeof fileContent === "string") {
                    wsFile.file_name = file.name
                    wsFile.file_size= file.size
                    wsFile.file_type= file.type
                    wsFile.file_data = fileContent
                }
                const msg = new OnlineWsMessage
                msg.type = 'chat_message'
                msg.content = message
                msg.content_type= "file"
                msg.uuid= crypto.randomUUID()
                msg.target_id= Friend.Friend.user_id
                msg.file = wsFile
                if (setMessage) {
                    setMessage("")
                }
                SendOnlineWsMsg(
                    msg
                ).then(r => console.log(r))
            };
            reader.readAsDataURL(file);
        });}
    return (
        <div className="bg-background text-foreground overflow-hidden flex flex-col h-full rounded-xl px-4 pt-4 dark:text-gray-100">
            {/* Header */}
            <div className="flex items-center text-foreground  sticky top-0 gap-2 px-1 py-1.5 text-left text-sm border-b border-blue-500 pb-2">
                <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={Friend.Friend?.user_image} alt={"avatar"}/>
                    <AvatarFallback className="rounded-lg">
                        {`${Friend.Friend?.first_name ? Friend.Friend?.first_name[0] : ''}${Friend.Friend?.last_name ? Friend.Friend?.last_name[0] : ''}`}
                    </AvatarFallback>
                    {Friend.online && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    )}
                </Avatar>
                <div className="grid flex-1 text-left text-md leading-tight">
                    <span className="truncate font-medium">
                        {`${Friend.Friend?.first_name} ${Friend.Friend?.last_name}`}
                    </span>
                    <span className="truncate text-xs">
                        {Friend.Friend?.gigatag}
                    </span>
                </div>

                {/* Right side: actions */}
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost">
                        <Phone className="h-6 w-6" />
                    </Button>
                    <Button size="icon" variant="ghost">
                        <Video className="h-6 w-6" />
                    </Button>
                    <Button size="icon" variant="ghost">
                        <User className="h-6 w-6" />
                    </Button>

                    {/* Search input */}
                    <div className="relative hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-2 pr-8 py-1 rounded-lg text-sm bg-background dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>
            {/* Chat area */}
            <div className="flex flex-col-reverse flex-1 min-h-0 overflow-y-auto gap-5 py-6">
                {[...messages].reverse().map((m, i, reversed) => {
                    const isSelf = m.created_by_id === Friend.selfId;

                    // --- Determine if we should show avatar ---
                    const prev = reversed[i + 1];
                    let showAvatar = true;

                    if (prev && prev.created_by_id === m.created_by_id) {
                        const prevTime = new Date(prev.created_at).getTime();
                        const currTime = new Date(m.created_at).getTime();
                        const diffMinutes = (currTime - prevTime) / 60000;
                        // only show if > 10 minutes passed since previous msg
                        showAvatar = diffMinutes > 10;
                    }

                    return (
                        <div
                            key={m.uuid}
                            className={`flex items-end gap-2 ${
                                isSelf ? "self-end flex-row-reverse" : "self-start"
                            }`}
                        >
                            {/* Avatar */}
                            {showAvatar ? (
                                <Avatar className="h-6 w-6">
                                    <AvatarImage
                                        src={isSelf ? Friend.selfImg : Friend.Friend?.user_image}
                                        alt={isSelf ? "Me" : "friend"}
                                    />
                                    <AvatarFallback>
                                        {isSelf ? "Me" : Friend.Friend?.first_name?.[0] ?? "F"}
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="h-6 w-6" />
                            )}

                            {/* Message + Dropdown */}
                            <div className="group relative flex items-center">
                                {/* Message bubble */}
                                <div
                                    className={`max-w-xs rounded-lg px-3 py-2 text-sm space-y-2 ${
                                        isSelf
                                            ? "bg-chat text-chat-foreground"
                                            : "bg-chat2 text-chat2-foreground"
                                    }`}
                                >
                                    {m.content && <div>{m.content}</div>}

                                    {m?.media?.map((media, idx) => {
                                        const fileType = media?.type || "";

                                        if (fileType.startsWith("image/")) {
                                            return (
                                                <img
                                                    key={idx}
                                                    src={media.url}
                                                    alt={media.name}
                                                    onClick={() => setPopupImage(media.url)}
                                                    className="cursor-pointer rounded-lg max-w-full max-h-60 object-cover transition hover:opacity-80"
                                                />
                                            );
                                        }

                                        if (fileType === "application/pdf") {
                                            return (
                                                <div key={idx}
                                                    className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600"
                                                >
                                                    <iframe
                                                        src={`${media.url}#toolbar=0`}
                                                        className="w-full h-48"
                                                        title={media.name}
                                                    />
                                                    <div className="flex items-center justify-between px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800">
                                                        <span className="truncate">{media.name}</span>
                                                        <a
                                                            href={media.url}
                                                            download={media.name}
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            Download
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <FilePreview key={idx} name={media.name} url={media.url} />
                                        );
                                    })}
                                    <div className={`flex items-center gap-1 text-[10px] opacity-70 ${
                                        isSelf ? "justify-end" : "justify-start"
                                    }`}>
                                        {isEditedStatus(m.status) && (
                                            <span className="italic">edited</span>
                                        )}

                                        <span>{formatTime(m.created_at)}</span>

                                        {/* Only show ticks for self messages */}
                                        {isSelf && <StatusTicks status={m.status} />}
                                    </div>
                                </div>

                                {/* Dropdown Menu Button */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity absolute ${
                                                isSelf ? "-left-7" : "-right-7"
                                            } top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600`}
                                        >
                                            <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                        </button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                        align={isSelf ? "start" : "end"}
                                        className="w-40 bg-chat2 text-chat2-foreground"
                                    >
                                        {/* Common actions */}
                                        <DropdownMenuItem onClick={() => handleMessageAction("reply", m)}>
                                            <Reply className="mr-2 h-4 w-4 text-chat2-foreground" /> Reply
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleMessageAction("forward", m)}>
                                            <Forward className="mr-2 h-4 w-4 text-chat2-foreground" /> Forward
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleMessageAction("copy", m)}>
                                            <Copy className="mr-2 h-4 w-4 text-chat2-foreground" /> Copy
                                        </DropdownMenuItem>
                                        {/* Only show for self messages */}
                                        {isSelf && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleMessageAction("edit", m)}
                                                className="text-yellow-500 focus:text-yellow-500"
                                                >
                                                    <Edit className="mr-2 h-4 w-4 text-yellow-500" /> Edit
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleMessageAction("delete", m)}
                                                    className="text-red-500 focus:text-red-500"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 text-red-500" /> Delete
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {m.err && m.err !== "" && <MessageError err={m.err}/>}
                            </div>
                        </div>

                    );
                })}

                {/* Scroll marker */}
                <div ref={messagesEndRef} />

            </div>

            {/* Input at the bottom */}
            <ChatInputBar
                placeholder={`Message @${Friend.Friend.first_name}`}
                onSend={(msg, files, setMessage) => {
                    if (files.length > 0){
                        sendFiles(msg, files, setMessage);
                    }else{
                        sendTextMsg(msg);
                    }
                    console.log("Sending:", msg);
                    console.log("Files:", files)
                }}
                className={"bg-background/10 text-foreground flex-shrink-0 sticky bottom-0 left-0 right-0 bg-muted/0 backdrop-blur-md p-2 flex items-end gap-2 "}
                friendId={Friend?.Friend?.user_id}
            />
            {popupImage && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                    onClick={() => setPopupImage(null)} // close when clicking background
                >
                    <img
                        src={popupImage}
                        alt="Popup"
                        className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg bg-white/10"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
                    />
                </div>
            )}
        </div>

    );
}
