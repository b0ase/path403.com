import { useState } from 'react';
import { FiPlay, FiPlus, FiTrash2, FiClock, FiMonitor, FiGrid } from 'react-icons/fi';
import type { GeneratedVideo } from '@/types/nano-banana';

interface LibraryProps {
    videos: GeneratedVideo[];
    onAddToTimeline: (video: GeneratedVideo) => void;
    onDeleteVideo: (videoId: string) => void;
}

export default function Library({
    videos,
    onAddToTimeline,
    onDeleteVideo,
}: LibraryProps) {
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border border-zinc-900 border-dashed rounded-pillar bg-zinc-950/20 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-pillar bg-zinc-900 flex items-center justify-center text-zinc-800 mb-6">
                    <FiGrid size={24} />
                </div>
                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                    LIBRARY_EMPTY
                </h3>
                <p className="text-zinc-800 text-[9px] uppercase font-bold tracking-widest max-w-xs mx-auto">
                    NO_ASSETS_FOUND. INITIALIZE_GENERATIVE_SEQUENCE.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
                <div
                    key={video.id}
                    className="group relative bg-black border border-zinc-900 rounded-pillar overflow-hidden hover:border-white transition-all duration-300"
                >
                    {/* Video Preview */}
                    <div className="relative aspect-[9/16] bg-black">
                        {playingVideoId === video.id ? (
                            <video
                                src={video.url}
                                className="w-full h-full object-cover"
                                autoPlay
                                controls
                                onEnded={() => setPlayingVideoId(null)}
                            />
                        ) : (
                            <div className="relative w-full h-full">
                                {/* Fallback pattern if no thumbnail */}
                                {video.thumbnail_url ? (
                                    <img src={video.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.prompt} />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center">
                                        <span className="text-4xl opacity-20">🎬</span>
                                    </div>
                                )}

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setPlayingVideoId(video.id)}
                                        className="w-12 h-12 bg-white text-black border border-white flex items-center justify-center hover:scale-110 transition-all rounded-pillar"
                                    >
                                        <FiPlay size={18} className="ml-0.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1 pointer-events-none">
                            <span className="bg-black/80 border border-zinc-900 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-pillar flex items-center gap-1">
                                <FiClock size={10} /> {video.duration}S
                            </span>
                        </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="p-4 border-t border-zinc-900">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest line-clamp-2 min-h-[32px] mb-4 leading-relaxed" title={video.prompt}>
                            {video.prompt}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onAddToTimeline(video)}
                                className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200
                                           font-black text-[10px] uppercase tracking-widest rounded-pillar
                                           flex items-center justify-center gap-1.5 transition-all"
                            >
                                <FiPlus size={14} /> COMMIT
                            </button>
                            <button
                                onClick={() => onDeleteVideo(video.id)}
                                className="p-2.5 text-zinc-600 hover:text-white hover:bg-zinc-900 border border-zinc-900
                                           rounded-pillar transition-all"
                                title="Delete Video"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

