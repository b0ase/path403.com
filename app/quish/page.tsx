import React from 'react';

export default function QuishPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md text-center space-y-6">
                <h1 className="text-6xl font-bold text-red-500 mb-8">YOU HAVE BEEN QUISHED</h1>
                <div className="flex justify-center mb-8">
                    <img
                        src="/images/blog/quishing-skull.png"
                        alt="Skull QR Code"
                        className="w-[512px] h-[512px] border-4 border-red-500/20 rounded-lg shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                    />
                </div>
                <p className="text-xl text-zinc-400">
                    If this were a real attack, your session tokens would be gone.
                </p>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-mono text-zinc-500">
                    This is a demonstration of how easy it is to trust a QR code.
                </div>
            </div>
        </div>
    );
}
