import { useState, useRef, useEffect } from "react";

export default function MessageError({ err }: { err: string }) {
    const [position, setPosition] = useState<"center" | "left" | "right">("center");
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tooltip = tooltipRef.current;
        if (!tooltip) return;

        const rect = tooltip.getBoundingClientRect();
        const padding = 8; // keep a small margin from the screen

        if (rect.left < padding) {
            setPosition("left");
        } else if (rect.right > window.innerWidth - padding) {
            setPosition("right");
        } else {
            setPosition("center");
        }
    }, [err]);

    return (
        <div className="ml-2">
            <div className="relative group/error">
                {/* Red alert dot */}
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse cursor-help" />

                {/* Tooltip */}
                <div
                    ref={tooltipRef}
                    className={`absolute bottom-full mb-1 bg-red-600 text-white text-xs rounded px-2 py-1 opacity-0 group-hover/error:opacity-100 transition-opacity pointer-events-none shadow-lg z-50 max-w-[200px] break-words ${
                        position === "center"
                            ? "left-1/2 -translate-x-1/2"
                            : position === "left"
                                ? "left-0 translate-x-0"
                                : "right-0 translate-x-0"
                    }`}
                >
                    {err}
                </div>
            </div>
        </div>
    );
}
