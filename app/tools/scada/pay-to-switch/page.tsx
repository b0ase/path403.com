import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiDollarSign, FiLock, FiActivity, FiArrowRight } from 'react-icons/fi';

export default function PayToSwitchPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_100%,#064e3b_0%,transparent_50%)] pointer-events-none opacity-40" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none opacity-20 brightness-100 contrast-150" />

            <div className="relative z-10 p-8 md:p-16 max-w-6xl mx-auto">
                <Link
                    href="/tools/scada"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to SCADA Tools
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-start mb-24">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                            Pay-to-<span className="text-emerald-500">Switch</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed text-balance">
                            Monetize your physical infrastructure. Enable secure, transactional control over SCADA state changes through micro-payments and multi-sig authorization directly on the ledger.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <FiDollarSign className="text-emerald-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Transactional Authorization</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Authority to change critical system states is granted only upon verified on-chain payment, ensuring zero-trust utility delivery.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <FiLock className="text-blue-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Smart Escrow Control</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Control commands are unlocked via escrow, releasing funds only when the hardware acknowledges successful state transition.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <Image
                            src="/images/projects/robust-ae/smart-environmental-monitor-main.jpg"
                            alt="Smart Infrastructure Authorization"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-8 text-white">Utility-as-a-Service (UaaS)</h2>
                    <p className="text-lg text-zinc-300 leading-relaxed mb-12">
                        The integration of BSV payments with Robust AE hardware transforms static infrastructure into a proactive service platform. This enables new business models for utilities, private smart-grids, and decentralized manufacturing facilities.
                    </p>

                    <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 p-12 my-20 rounded-3xl border border-zinc-800 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <FiActivity className="text-emerald-500" /> Granular Metering
                            </h4>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                Robust AE environmental monitors can act as gatekeepers for industrial utilities. A client authorizing a micro-transaction "opens the valve" for a specific duration or volume, with the entire handshake happening on-chain.
                            </p>
                        </div>
                        <div className="w-px h-24 bg-zinc-800 hidden md:block" />
                        <div className="flex-1">
                            <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <FiLock className="text-blue-500" /> Multi-Sig Gating
                            </h4>
                            <p className="text-zinc-400 leading-relaxed text-lg">
                                Authorize hazardous operations only when multiple stakeholders—including an on-chain safety officer or insurer—have signed off with their respective private keys.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center mt-12">
                        <Link
                            href="/work/robust-ae"
                            className="inline-flex items-center gap-2 text-white font-bold group"
                        >
                            View Robust AE Hardware Suite <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}