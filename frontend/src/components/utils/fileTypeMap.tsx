// File type map: extension -> { type, color }
import type {IconType} from "react-file-icon";

export const fileTypeMap: Record<string, { type: IconType; color: string }> = {
    // Images
    jpg: { type: "image", color: "#F4B400" },
    jpeg: { type: "image", color: "#F4B400" },
    png: { type: "image", color: "#F4B400" },
    gif: { type: "image", color: "#F4B400" },
    bmp: { type: "image", color: "#F4B400" },
    svg: { type: "image", color: "#F4B400" },
    webp: { type: "image", color: "#F4B400" },
    tiff: { type: "image", color: "#F4B400" },

    // Documents
    pdf: { type: "document", color: "#D32F2F" },
    doc: { type: "document", color: "#1E88E5" },
    docx: { type: "document", color: "#1E88E5" },
    txt: { type: "document", color: "#6D6D6D" },
    rtf: { type: "document", color: "#607D8B" },
    odt: { type: "document", color: "#1E88E5" },

    // Spreadsheets
    xls: { type: "spreadsheet", color: "#1A754C" },
    xlsx: { type: "spreadsheet", color: "#1A754C" },
    ods: { type: "spreadsheet", color: "#1A754C" },
    csv: { type: "spreadsheet", color: "#1A754C" },

    // Presentations
    ppt: { type: "presentation", color: "#E64A19" },
    pptx: { type: "presentation", color: "#E64A19" },
    odp: { type: "presentation", color: "#E64A19" },

    // Archives
    zip: { type: "compressed", color: "#F9A825" },
    rar: { type: "compressed", color: "#F9A825" },
    "7z": { type: "compressed", color: "#F9A825" },
    tar: { type: "compressed", color: "#F9A825" },
    gz: { type: "compressed", color: "#F9A825" },

    // Code files
    js: { type: "code", color: "#F7DF1E" },
    ts: { type: "code", color: "#3178C6" },
    jsx: { type: "code", color: "#61DAFB" },
    tsx: { type: "code", color: "#3178C6" },
    html: { type: "code", color: "#E34F26" },
    css: { type: "code", color: "#1572B6" },
    json: { type: "code", color: "#FBC02D" },
    py: { type: "code", color: "#3776AB" },
    go: { type: "code", color: "#00ADD8" },
    rb: { type: "code", color: "#CC342D" },
    php: { type: "code", color: "#777BB4" },
    c: { type: "code", color: "#A8B9CC" },
    cpp: { type: "code", color: "#00599C" },
    java: { type: "code", color: "#EA2D2E" },
    cs: { type: "code", color: "#68217A" },
    sh: { type: "code", color: "#4EAA25" },

    // Audio
    mp3: { type: "audio", color: "#8E24AA" },
    wav: { type: "audio", color: "#8E24AA" },
    ogg: { type: "audio", color: "#8E24AA" },
    flac: { type: "audio", color: "#8E24AA" },
    m4a: { type: "audio", color: "#8E24AA" },

    // Video
    mp4: { type: "video", color: "#0288D1" },
    mov: { type: "video", color: "#0288D1" },
    avi: { type: "video", color: "#0288D1" },
    mkv: { type: "video", color: "#0288D1" },
    webm: { type: "video", color: "#0288D1" },

    // Fonts
    ttf: { type: "font", color: "#5D4037" },
    otf: { type: "font", color: "#5D4037" },
    woff: { type: "font", color: "#5D4037" },
    woff2: { type: "font", color: "#5D4037" },

    // Misc
    iso: { type: "settings", color: "#455A64" },
    exe: { type: "binary", color: "#616161" },
    app: { type: "binary", color: "#616161" },
    dmg: { type: "settings", color: "#455A64" },
};

// Default fallback
export const getFileType = (ext: string) => {
    const lowerExt = ext.toLowerCase();
    return (
        fileTypeMap[lowerExt] || {
            type: "document",
            color: "#9E9E9E",
        }
    );
};
