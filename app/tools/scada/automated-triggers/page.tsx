import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiZap, FiSettings, FiCpu, FiShield } from 'react-icons/fi';

export default function AutomatedTriggersPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_100%_0%,#422006_0%,transparent_50%)] pointer-events-none opacity-40" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none opacity-20 brightness-100 contrast-150" />

            <div className="relative z-10 p-8 md:p-16 max-w-6xl mx-auto">
                <Link
                    href="/tools/scada"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to SCADA Tools
                </Link>

                <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="order-2 lg:order-1 relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <Image
                            src="/images/projects/robust-ae/precision-motor-controller-main.jpg"
                            alt="Precision Motor Control Trigger"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="order-1 lg:order-2">
                        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight">
                            Automated <span className="text-yellow-500">Triggers</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed text-balance">
                            Deterministic automation powered by smart contracts. Create fail-safe control loops that execute based on verified physical state data recorded directly on the BSV ledger.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                    <FiZap className="text-yellow-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Self-Executing Protocols</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Shutdowns and process adjustments happen automatically when on-chain conditions are met, removing the risk of human oversight.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <FiCpu className="text-purple-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Edge Consensus</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Robust AE's controllers communicate directly with the chain to validate safety thresholds in real-time.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-8 text-white">Autonomous Control Loops</h2>
                    <p className="text-lg text-zinc-300 leading-relaxed mb-12">
                        By moving industrial trigger logic from centralized servers to the blockchain, we create a distributed nervous system for infrastructure. This ensures that critical safety protocols cannot be overridden by unauthorized personnel or malfunctioning intermediate servers.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 my-20">
                        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl">
                            <FiSettings className="text-blue-500 text-2xl mb-6" />
                            <h4 className="text-xl font-bold mb-4 text-white">FOC Dynamic Optimization</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                Smart contracts monitor Field-Oriented Control (FOC) data from Robust AE motor controllers to optimize efficiency and predict mechanical wear dynamically.
                            </p>
                        </div>
                        <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-2xl">
                            <FiShield className="text-red-500 text-2xl mb-6" />
                            <h4 className="text-xl font-bold mb-4 text-white">Immutable Fail-Safes</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                Emergency Shutdown (ESD) procedures are encoded as smart contracts, ensuring they execute regardless of local network availability or operational status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}