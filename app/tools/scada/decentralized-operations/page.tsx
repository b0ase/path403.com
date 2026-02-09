import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiShare2, FiShield, FiGlobe, FiCpu } from 'react-icons/fi';

export default function DecentralizedOperationsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_100%,#1e3a8a_0%,transparent_50%)] pointer-events-none opacity-40" />
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
                            src="/images/projects/robust-ae/industrial-control-2.jpg"
                            alt="Decentralized Industrial Logic"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="order-1 lg:order-2">
                        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight tracking-tight text-white">
                            Decentralized <span className="text-blue-500">Operations</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed text-balance">
                            Eliminating single points of failure in mission-critical infrastructure. Distribute command logic across a global network of nodes to ensure high availability and resistance to censorship.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <FiShare2 className="text-blue-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Peer-to-Edge Governance</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">System resilience is maximized by distributing control logic across a global network of authenticated nodes.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <FiShield className="text-emerald-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Resilient Consensus</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Operations continue even if central command centers are offline, relaying state via Byzantine Fault Tolerant protocols.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-8 text-white text-center">Architectural Resilience</h2>
                    <p className="text-lg text-zinc-300 leading-relaxed mb-16 text-center max-w-3xl mx-auto">
                        By integrating Robust AE's edge hardware with a decentralized consensus layer, we harden infrastructure against physical and cyber-attacks. Control is no longer a hierarchy, but a distributed agreement.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 my-20">
                        <div className="group p-8 bg-zinc-950 border border-zinc-900 rounded-3xl hover:border-zinc-700 transition-colors">
                            <FiGlobe className="text-blue-500 text-2xl mb-6" />
                            <h4 className="text-lg font-bold mb-4 text-white">Global State Sync</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Every Robust AE controller acts as an autonomous node, participating in network consensus to validate state changes across the entire facility.
                            </p>
                        </div>
                        <div className="group p-8 bg-zinc-950 border border-zinc-900 rounded-3xl hover:border-zinc-700 transition-colors">
                            <FiCpu className="text-emerald-500 text-2xl mb-6" />
                            <h4 className="text-lg font-bold mb-4 text-white">Edge-to-Chain</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Direct integration means hardware-level signals are converted into on-chain events with zero intermediary latency or central proxy servers.
                            </p>
                        </div>
                        <div className="group p-8 bg-zinc-950 border border-zinc-900 rounded-3xl hover:border-zinc-700 transition-colors">
                            <FiShield className="text-blue-500 text-2xl mb-6" />
                            <h4 className="text-lg font-bold mb-4 text-white">Fault Tolerance</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Redundant paths ensure that even if portion of the network is compromised, the overall system maintains its operational integrity.
                            </p>
                        </div>
                    </div>

                    <p className="text-xl text-zinc-300 leading-relaxed text-center mt-12 italic text-zinc-500">
                        "Decentralize control, centralize accountability."
                    </p>
                </div>
            </div>
        </div>
    );
}