import { useRef } from 'react';
import { FiArrowLeft, FiArrowRight, FiTrash2, FiFilm } from 'react-icons/fi';
import type { TimelineClip } from '@/types/nano-banana';

interface TimelineProps {
    clips: TimelineClip[];
    selectedClipId: string | null;
    onSelectClip: (clipId: string) => void;
    onRemoveClip: (clipId: string) => void;
    onMoveClip: (clipId: string, direction: 'up' | 'down') => void;
}

export default function Timeline({
    clips,
    selectedClipId,
    onSelectClip,
    onRemoveClip,
    onMoveClip,
}: TimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (clips.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-16 border border-zinc-900 border-dashed rounded-pillar bg-zinc-950/20 text-center min-h-[400px]">
                <div className="w-16 h-16 rounded-pillar bg-zinc-900 flex items-center justify-center text-zinc-800 mb-6">
                    <FiFilm size={24} />
                </div>
                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                    SEQUENCER_EMPTY
                </h3>
                <p className="text-zinc-800 text-[9px] uppercase font-bold tracking-widest max-w-xs mx-auto">
                    NO_DATA_PKTS_LOADED. COMMIT_ASSETS_TO_TRACK_01.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Timeline Track (Horizontal Scroll) */}
            <div className="relative border border-zinc-900 rounded-pillar bg-black p-1">
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-1 p-4 pb-8 min-h-[180px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                >
                    {/* Time Ruler (Visual) */}
                    <div className="absolute bottom-2 left-4 right-4 h-4 flex pointer-events-none opacity-10 border-t border-zinc-800">
                        {Array.from({ length: Math.max(10, clips.length * 2) }).map((_, i) => (
                            <div key={i} className="flex-1 border-r border-zinc-900 h-2 mt-0 relative">
                                <span className="absolute -bottom-4 -left-2 text-[8px] text-zinc-800 font-bold uppercase tracking-widest">{i * 5}S</span>
                            </div>
                        ))}
                    </div>

                    {clips.map((clip, index) => {
                        const isSelected = clip.id === selectedClipId;

                        return (
                            <div
                                key={clip.id}
                                onClick={() => onSelectClip(clip.id)}
                                className={`
                                    relative flex-shrink-0 w-28 h-40 rounded-pillar overflow-hidden cursor-pointer transition-all duration-200
                                    border z-10
                                    ${isSelected
                                        ? 'border-white scale-105 z-20'
                                        : 'border-zinc-900 opacity-60 hover:opacity-100 hover:border-zinc-700'}
                                `}
                            >
                                {/* Thumbnail */}
                                {clip.thumbnailUrl ? (
                                    <img src={clip.thumbnailUrl} alt="clip" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                        <FiFilm className="text-zinc-600" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Index Badge */}
                                <div className="absolute top-2 left-2 w-5 h-5 rounded-pillar bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center">
                                    <span className="text-[9px] text-white font-bold">{index + 1}</span>
                                </div>

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-pillar bg-black/80 border border-white/10">
                                    <span className="text-[8px] text-white font-bold uppercase tracking-widest">{clip.duration}S</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add placeholder at end */}
                    <div className="flex-shrink-0 w-28 h-40 border-2 border-zinc-900 border-dashed rounded-pillar flex items-center justify-center opacity-20">
                        <span className="text-xl text-zinc-900 font-bold">+</span>
                    </div>
                </div>
            </div>

            {/* Selected Clip Controls */}
            {selectedClipId ? (
                <div className="bg-zinc-950/40 border border-zinc-900 rounded-pillar p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1.5">SELECTED_PKT</p>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                                <p className="text-[11px] text-white font-bold uppercase tracking-widest truncate max-w-[300px]">
                                    {clips.find(c => c.id === selectedClipId)?.prompt || 'UNTITLED_CLIP'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-black p-1 rounded-pillar border border-zinc-900">
                            <button
                                onClick={() => onMoveClip(selectedClipId, 'up')}
                                disabled={clips[0].id === selectedClipId}
                                className="p-2.5 hover:bg-zinc-900 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded-pillar transition-all"
                                title="Move Left"
                            >
                                <FiArrowLeft size={16} />
                            </button>
                            <div className="w-px bg-zinc-900 mx-1 my-1" />
                            <button
                                onClick={() => onMoveClip(selectedClipId, 'down')}
                                disabled={clips[clips.length - 1].id === selectedClipId}
                                className="p-2.5 hover:bg-zinc-900 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent rounded-pillar transition-all"
                                title="Move Right"
                            >
                                <FiArrowRight size={16} />
                            </button>
                        </div>

                        <button
                            onClick={() => onRemoveClip(selectedClipId)}
                            className="flex items-center gap-3 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white border border-zinc-800 rounded-pillar transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                            <FiTrash2 size={14} /> SCRUB_CLIP
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-16 flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-800 bg-zinc-950/20 border border-zinc-900/50 border-dashed rounded-pillar">
                    AWAITING_PKT_SELECTION
                </div>
            )}
        </div>
    );
}
