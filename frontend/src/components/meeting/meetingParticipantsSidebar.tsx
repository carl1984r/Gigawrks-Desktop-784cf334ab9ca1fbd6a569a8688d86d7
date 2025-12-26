import VideoTile from "@/components/meeting/videoTile";
import type { viewer } from "@/components/utils/MeetingPeerConnection";
import type { userStreams } from "@/components/utils/remoteStreams";


interface IProps {
    viewers: viewer[];
    remoteStreams: Map<number, userStreams>;
    setMainViewer: (viewer: null | viewer) => void;
    mainViewer: viewer | null;
    selfID?: number
}

export default function MeetingParticipantsSidebar({
                                                       viewers,
                                                       remoteStreams,
                                                       setMainViewer,
                                                       selfID,
                                                       // mainViewer,
                                                   }: IProps) {
    const visibleViewers = viewers.slice(0, 5);
    const remainingCount = viewers.length - 5;

    return (
        <div
            className="
        grid
        gap-4
        w-full
        h-full
        justify-center
        mx-auto
      "
            style={{
                gridTemplateColumns:
                    visibleViewers.length-1 <= 3
                        ? `repeat(${visibleViewers.length-1}, 0.5fr)`
                        : "repeat(3, minmax(300px, 0.3fr))",
                gridAutoRows: "minmax(200px, 1fr)",
                maxHeight: "calc(2 * 33vh)",
            }}
        >
            {visibleViewers.map((p, i) => {
                // const isActive = mainViewer?.id === p.id;
                if (p.id === selfID) {
                    // return (
                    //     <div
                    //         key={i}
                    //         onClick={() => setMainViewer(p)}
                    //         className={`cursor-pointer transition-all duration-300
                    //
                    //         `}
                    //     >
                    //         <VideoTile
                    //             stream={{ video: localVideo, audio: localAudio }}
                    //             viewer={p}
                    //         />
                    //     </div>
                    // )
                    return null;
                } else {
                    return (
                    <div
                        key={i}
                        onClick={() => setMainViewer(p)}
                        className={`cursor-pointer transition-all duration-300 
                        
                            `}
                    >
                        <VideoTile
                            stream={remoteStreams.get(p.id)}
                            viewer={p}

                        />
                    </div>
                );
                }
            })}

            {remainingCount-1 > 0 && (
                <div className="flex flex-col items-center justify-center bg-gray-800 rounded-xl p-4 aspect-video">
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
                        +{remainingCount}
                    </div>
                    <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-full">
                        See All Participants
                    </button>
                </div>
            )}
        </div>



    // <div
    //     className={`grid gap-4 transition-all duration-500 w-full h-full ${
    //         mainViewer ? "grid-cols-4 grid-rows-3" : "grid-cols-3 grid-rows-2"
    //     }`}
    // >
    //     {viewers.map((p) => {
    //         const isMain = mainViewer?.id === p.id;
    //         return (
    //             <div
    //                 key={p.id}
    //                 onClick={() =>
    //                     setMainViewer(isMain ? null : p) // click again to unselect
    //                 }
    //                 className={`relative cursor-pointer transition-all duration-500 rounded-2xl overflow-hidden
    //               ${isMain ? "col-span-4 row-span-3 scale-100 z-20" : "hover:scale-105"}
    //             `}
    //                 style={{
    //                     gridColumn: isMain ? "span 4" : undefined,
    //                     gridRow: isMain ? "span 3" : undefined,
    //                 }}
    //             >x
    //                 <VideoTile stream={remoteStreams.get(p.id)} viewer={p} />
    //                 {isMain && (
    //                     <div className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-md text-sm">
    //                         {p.first_name}
    //                     </div>
    //                 )}
    //             </div>
    //         );
    //     })}
    //            {remainingCount > 0 && (
    //                <div className="flex flex-col items-center justify-center bg-gray-800 rounded-xl p-4 aspect-video">
    //                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-lg">
    //                        +{remainingCount}
    //                    </div>
    //                    <button className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-full">
    //                        See All Participants
    //                    </button>
    //                </div>
    //            )}
    // </div>
    );
}
