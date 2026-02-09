'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiHome, FiEdit3, FiDownload, FiPlay } from 'react-icons/fi';

export default function CherryExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  const [lastExport, setLastExport] = useState<any>(null);

  const exportChaosVideo = async (duration: number) => {
    if (isExporting) return;
    
    setIsExporting(true);
    setExportProgress('Starting export...');
    
    try {
      setExportProgress('Generating chaos sequence...');
      
      const response = await fetch('/api/export/cherry-video-chaos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration }),
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const result = await response.json();
      setExportProgress('Export complete! Starting download...');
      
      // Trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = result.downloadUrl;
      downloadLink.download = result.outputFile;
      downloadLink.click();
      
      setLastExport(result);
      setExportProgress('');
      
    } catch (error: any) {
      console.error('Export failed:', error);
      setExportProgress(`Export failed: ${error.message}`);
      setTimeout(() => setExportProgress(''), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-black to-red-950 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2 text-pink-400/50 text-xs">
          <Link href="/video" className="hover:text-pink-400 transition-colors">
            <FiHome size={12} />
          </Link>
          <span>/</span>
          <Link href="/video/editor" className="hover:text-pink-400 transition-colors">
            <FiEdit3 size={12} />
          </Link>
          <span>/</span>
          <Link href="/video/editor/cherry" className="hover:text-pink-400 transition-colors">
            cherry
          </Link>
          <span>/</span>
          <span>export</span>
        </div>
        <div className="text-2xl">🍒</div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-pink-300 mb-4">Cherry Video Export</h1>
            <p className="text-pink-400/70 text-sm">
              Generate chaotic music videos from your cherry-graf collection
            </p>
          </div>

          {/* Export options */}
          <div className="space-y-4">
            <div className="bg-black/40 border border-pink-500/20 rounded-lg p-6 space-y-4">
              <h2 className="text-pink-300 font-semibold">Quick Export</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => exportChaosVideo(5)}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/20 hover:bg-pink-500/30 disabled:bg-pink-500/10 border border-pink-500/40 rounded text-pink-300 text-sm transition-colors disabled:cursor-not-allowed disabled:text-pink-500"
                >
                  <FiDownload size={14} />
                  5 seconds
                </button>
                <button
                  onClick={() => exportChaosVideo(15)}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/20 hover:bg-pink-500/30 disabled:bg-pink-500/10 border border-pink-500/40 rounded text-pink-300 text-sm transition-colors disabled:cursor-not-allowed disabled:text-pink-500"
                >
                  <FiDownload size={14} />
                  15 seconds
                </button>
                <button
                  onClick={() => exportChaosVideo(30)}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/20 hover:bg-pink-500/30 disabled:bg-pink-500/10 border border-pink-500/40 rounded text-pink-300 text-sm transition-colors disabled:cursor-not-allowed disabled:text-pink-500"
                >
                  <FiDownload size={14} />
                  30 seconds
                </button>
                <button
                  onClick={() => exportChaosVideo(60)}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-pink-500/20 hover:bg-pink-500/30 disabled:bg-pink-500/10 border border-pink-500/40 rounded text-pink-300 text-sm transition-colors disabled:cursor-not-allowed disabled:text-pink-500"
                >
                  <FiDownload size={14} />
                  1 minute
                </button>
              </div>
            </div>

            <div className="bg-black/40 border border-pink-500/20 rounded-lg p-6">
              <h2 className="text-pink-300 font-semibold mb-4">Music Video Length</h2>
              <button
                onClick={() => exportChaosVideo(100)}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-500/30 to-red-500/30 hover:from-pink-500/40 hover:to-red-500/40 disabled:from-pink-500/10 disabled:to-red-500/10 border border-pink-500/40 rounded text-pink-300 font-semibold transition-colors disabled:cursor-not-allowed disabled:text-pink-500"
              >
                <FiDownload size={16} />
                Export 1:40 Music Video
              </button>
              <p className="text-pink-400/50 text-xs mt-2 text-center">
                Perfect length for social media posts
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          {exportProgress && (
            <div className="bg-black/60 border border-pink-500/20 rounded-lg p-4">
              <div className="text-pink-300 text-sm text-center animate-pulse">
                {exportProgress}
              </div>
            </div>
          )}

          {/* Last export info */}
          {lastExport && !isExporting && (
            <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-300 font-semibold mb-2">Last Export</h3>
              <div className="text-green-400/70 text-xs space-y-1">
                <p>File: {lastExport.outputFile}</p>
                <p>Duration: {lastExport.duration}s</p>
                <p>Videos used: {lastExport.videoCount}</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="text-center">
            <Link
              href="/video/editor/cherry"
              className="inline-flex items-center gap-2 text-pink-400/70 hover:text-pink-400 text-sm transition-colors"
            >
              <FiPlay size={14} />
              Back to Live Editor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}