import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiLock, FiCpu, FiShield, FiKey } from 'react-icons/fi';

export default function EnhancedSecurityPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,#0f172a_0%,transparent_50%)] pointer-events-none opacity-40" />
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
                            Enhanced <span className="text-blue-500">Security</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed text-balance">
                            Hardening industrial control at the hardware level. Secure communication, device authentication, and immutable security logs that make legacy intrusion methods obsolete.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <FiCpu className="text-blue-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Hardware-Level Identity</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Every edge controller possesses a unique on-chain identity, preventing spoofing and unauthorized network access.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <FiLock className="text-emerald-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Signed Firmware Hashes</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">System integrity is verified against on-chain hashes before every operation, neutralizing the risk of code injection.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <Image
                            src="/images/projects/robust-ae/industrial-control-1.jpg"
                            alt="Secure SCADA Infrastructure"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-8 text-white">Defense-in-Depth for Industry 4.0</h2>
                    <p className="text-lg text-zinc-300 leading-relaxed mb-6">
                        Security in the Robust AE ecosystem is not a software veneer—it is baked into the silicon and the protocol. By treating every SCADA component as a blockchain-native entity, we create a true zero-trust environment.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 my-20">
                        <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <FiShield className="text-blue-500 text-2xl mb-6" />
                            <h4 className="text-xl font-bold mb-4 text-white">Encrypted Telemetry</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                All data flowing from sensor terminals to the chain is encrypted using ephemeral keys, ensuring that even if physical lines are compromised, the data remains unreadable.
                            </p>
                        </div>
                        <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <FiKey className="text-emerald-500 text-2xl mb-6" />
                            <h4 className="text-xl font-bold mb-4 text-white">Decentralized Auth</h4>
                            <p className="text-zinc-500 leading-relaxed">
                                Access control is managed via smart contracts on the BSV ledger, removing the vulnerability of centralized password databases and single-point-of-failure authentication servers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}