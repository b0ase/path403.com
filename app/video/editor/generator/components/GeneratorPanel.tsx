import { useState } from 'react';
import { FiVideo, FiClock, FiMaximize, FiType } from 'react-icons/fi';
import type { GeneratedVideo, VideoGenerationParams } from '@/types/nano-banana';

interface GeneratorPanelProps {
  onVideoGenerated: (video: GeneratedVideo) => void;
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
}

export default function GeneratorPanel({
  onVideoGenerated,
  isGenerating,
  setIsGenerating,
}: GeneratorPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [params, setParams] = useState<VideoGenerationParams>({
    prompt: '',
    duration: 6,
    aspectRatio: '9:16',
    mode: 'normal',
  });
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      const response = await fetch('/api/google-ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: params.duration,
          aspectRatio: params.aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Video generation failed');
      }

      setGeneratedVideo(data.video);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToLibrary = () => {
    if (generatedVideo) {
      onVideoGenerated(generatedVideo);
      setGeneratedVideo(null);
      setPrompt('');
      setError(null);
    }
  };

  return (
    <div className="space-y-8 w-full max-w-none">
      {/* Prompt Input */}
      <div className="space-y-4">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
          PROMPT_SPECIFICATION
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="INPUT_TEXT_PROMPT_HERE..."
            disabled={isGenerating}
            className="w-full h-40 bg-black border border-zinc-900 rounded-pillar p-5
                        text-white text-sm placeholder-zinc-800
                        focus:border-white focus:outline-none focus:ring-1 focus:ring-white/10
                        disabled:opacity-50 disabled:cursor-not-allowed
                        resize-none transition-all font-mono"
          />
          <div className="absolute bottom-4 right-4 text-xs text-zinc-600">
            {prompt.length} chars
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Duration */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
            TIME_UNIT
          </label>
          <div className="flex bg-black p-1 rounded-pillar border border-zinc-900">
            {[3, 6].map((dur) => (
              <button
                key={dur}
                onClick={() => setParams({ ...params, duration: dur as 3 | 6 })}
                disabled={isGenerating}
                className={`flex-1 py-3 px-4 rounded-pillar text-[10px] font-bold uppercase tracking-widest transition-all
                  ${params.duration === dur
                    ? 'bg-white text-black'
                    : 'text-zinc-600 hover:text-zinc-400'
                  }
                  disabled:opacity-50`}
              >
                {dur}s
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
            FRAME_ASPECT
          </label>
          <div className="relative">
            <select
              value={params.aspectRatio}
              onChange={(e) =>
                setParams({
                  ...params,
                  aspectRatio: e.target.value as VideoGenerationParams['aspectRatio'],
                })
              }
              disabled={isGenerating}
              className="w-full appearance-none py-3 px-4 bg-black border border-zinc-900 rounded-pillar
                        text-white text-[10px] font-bold uppercase tracking-widest
                        focus:border-white focus:outline-none focus:ring-1 focus:ring-white/10
                        disabled:opacity-50 cursor-pointer"
            >
              <option value="9:16">9:16 (Vertical)</option>
              <option value="16:9">16:9 (Horizontal)</option>
              <option value="1:1">1:1 (Square)</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Model Style */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">
            LOGIC_MODE
          </label>
          <div className="relative">
            <select
              value={params.mode}
              onChange={(e) =>
                setParams({
                  ...params,
                  mode: e.target.value as VideoGenerationParams['mode'],
                })
              }
              disabled={isGenerating}
              className="w-full appearance-none py-3 px-4 bg-black border border-zinc-900 rounded-pillar
                        text-white text-[10px] font-bold uppercase tracking-widest
                        focus:border-white focus:outline-none focus:ring-1 focus:ring-white/10
                        disabled:opacity-50 cursor-pointer"
            >
              <option value="normal">Standard</option>
              <option value="fun">Creative</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-5 bg-white hover:bg-zinc-200
                    text-black font-black text-xs uppercase tracking-widest
                    rounded-pillar transition-all shadow-lg shadow-white/5
                    disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed
                    flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-800 border-t-black rounded-full animate-spin" />
              <span>EXECUTING_GENERATION...</span>
            </>
          ) : (
            <>
              <span>INITIALIZE_SEQUENCE</span>
              <FiVideo />
            </>
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <div className="text-red-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Generated Video Preview */}
      {generatedVideo && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">UNIT_OUTPUT</h3>
            <div className="flex gap-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              <span>{generatedVideo.duration}S</span>
              <span>&bull;</span>
              <span>{generatedVideo.aspect_ratio}</span>
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden ring-1 ring-zinc-800 shadow-2xl">
            <video
              src={generatedVideo.url}
              poster={generatedVideo.thumbnail_url}
              controls
              autoPlay
              className="w-full"
              style={{
                maxHeight: '500px',
                objectFit: 'contain',
              }}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleAddToLibrary}
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800
                           text-white text-[10px] font-bold uppercase tracking-widest
                           rounded-pillar transition-all flex items-center gap-2"
            >
              <span>COMMIT_TO_LIBRARY</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-8 bg-black border border-zinc-900 rounded-pillar">
        <h4 className="text-[10px] font-black text-zinc-800 uppercase tracking-widest mb-6 border-b border-zinc-950 pb-2">
          PROTOCOL_DIRECTIVES
        </h4>
        <ul className="space-y-2 text-zinc-400 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-orange-500/50 mt-0.5">•</span>
            Include keywords like "cinematic", "photorealistic", or "cartoon" for style control
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500/50 mt-0.5">•</span>
            Describe lighting: "golden hour", "neon lights", "soft studio lighting"
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500/50 mt-0.5">•</span>
            Specify camera movement: "slow pan", "zoom in", "static shot"
          </li>
        </ul>
      </div>
    </div>
  );
}
