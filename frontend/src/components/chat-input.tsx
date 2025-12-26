import {Loader2, Mic, Paperclip, Send, Smile, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
// import {Popover, PopoverContent, PopoverTrigger} from "@radix-ui/react-popover";
import {type EmojiClickData, Theme} from "emoji-picker-react";
import {
    type ChangeEvent,
    type Dispatch,
    type FormEvent,
    lazy,
    type SetStateAction,
    Suspense,
    useRef,
    useState
} from "react";

const EmojiPicker = lazy(() => import("emoji-picker-react"))


interface ChatInputBarProps {
    onSend: (msg: string, files: File[], setMessage?: Dispatch<SetStateAction<string>>) => void
    placeholder?: string
    className?: string
    friendId: number
}

export function ChatInputBar({
                                 onSend,
                                 placeholder,
                                 className,
                             }: ChatInputBarProps) {
    const [message, setMessage] = useState("")
    const [files, setFiles] = useState<File[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji)
    }
    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles])
        }
    }

    const handleRemoveFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }
    const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget
        target.style.height = "auto"
        if (target.scrollHeight <= 150) {
            target.style.overflowY = "hidden"
            target.style.height = target.scrollHeight + "px"
        } else {
            target.style.overflowY = "auto"
            target.style.height = "150px"
        }
        setMessage(target.value)
    }

    const handleSend = () => {
        if (message.trim() || files.length > 0) {
            onSend(message, files, setMessage)
            setMessage("")
            setFiles([])
        }
    }


    return (
        <div>
        {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {files.map((file, index) => {
                        const isImage = file.type.startsWith("image/");
                        return (
                            <div
                                key={index}
                                className="relative group  border dark:border-gray-600 overflow-hidden"
                            >
                                {isImage ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="h-20 w-20 object-cover"
                                    />
                                ) : (
                                    <div className="h-20 w-20 flex items-center justify-center text-xs bg-gray-200 dark:bg-gray-700">
                                        {file.name}
                                    </div>
                                )}
                                <button
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

        <div className={`${className}`}>
            {/* File Previews */}


            {/* Unified Input Bar */}
            <div
                className="w-full flex items-center gap-2 border border-bord    er bg-background rounded-full px-3 py-2
                 focus-within:ring-2 focus-within:ring-secondary"
            >
                {/* Emoji Picker Button */}
                <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:text-primary hover:bg-secondary">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-[320px]">
                        <Suspense
                            fallback={
                                <div className="flex justify-center items-center h-[400px]">
                                    <Loader2 className="animate-spin text-gray-500" />
                                </div>
                            }
                        >
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                theme={Theme.AUTO}
                                lazyLoadEmojis
                                width="100%"
                            />
                        </Suspense>
                    </PopoverContent>
                </Popover>

                {/* Textarea (grows as you type) */}
                <textarea
                    ref={textareaRef}
                    id="chat-input"
                    placeholder={placeholder || "Type a message..."}
                    rows={1}
                    className="flex-1 resize-none bg-transparent border-none focus:outline-none text-sm text-foreground!
                   dark:text-gray-100 overflow-y-auto max-h-[150px] scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600"
                    value={message}
                    onInput={handleInput}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />

                {/* File Upload */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full hover:text-primary hover:bg-secondary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>
                <input
                    type="file"
                    multiple
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {/* Mic */}
                <Button size="icon" variant="ghost" className="rounded-full hover:text-primary hover:bg-secondary">
                    <Mic className="h-5 w-5" />
                </Button>

                {/* Send */}
                <Button
                    size="icon"
                    className="rounded-full bg-primary hover:bg-secondary hover:text-primary text-secondary"
                    onClick={handleSend}
                >
                    <Send className="h-5 w-5" />
                </Button>
            </div>
        </div>
        </div>
    );

}
