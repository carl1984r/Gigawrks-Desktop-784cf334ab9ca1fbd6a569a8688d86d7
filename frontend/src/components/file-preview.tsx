import { FileIcon } from "react-file-icon"; // or your FileIcon component
import { Card, CardContent } from "@/components/ui/card";
import {getFileType} from "@/components/utils/fileTypeMap.tsx";

interface FilePreviewProps {
    name: string;
    url: string;
    color?: string;
}

export function FilePreview({ name, url, color }: FilePreviewProps) {
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
    };

    return (
        <Card
            onClick={handleDownload}
            className="group flex items-center gap-4 p-3 rounded-xl bg-muted/60 hover:bg-muted cursor-pointer transition-all border border-transparent hover:border-blue-400"
        >
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-white shadow-sm shrink-0">
                <FileIcon
                    color={color ? color : getFileType(name?.split(".")[1])["color"]}
                    // labelColor={getFileType(media.name?.split(".")[1])["color"]}
                    labelUppercase
                    type={getFileType(name?.split(".")[1])["type"]}
                    // glyphColor="rgba(255,255,255,0.4)"
                    extension={name?.split(".")[1]}
                />
            </div>

            <CardContent className="p-0 flex flex-col flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{name}</div>
                <div className="text-xs text-muted-foreground">Click to download</div>
            </CardContent>

            {/*<button*/}
            {/*    onClick={(e) => {*/}
            {/*        e.stopPropagation(); // prevent triggering card click*/}
            {/*        handleDownload();*/}
            {/*    }}*/}
            {/*    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition"*/}
            {/*>*/}
            {/*    <Download className="w-4 h-4 text-blue-500 group-hover:text-blue-600" />*/}
            {/*</button>*/}
        </Card>
    );
}
