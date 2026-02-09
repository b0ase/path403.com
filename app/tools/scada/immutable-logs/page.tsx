import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiShield, FiDatabase, FiLink } from 'react-icons/fi';

export default function ImmutableLogsPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_0%_0%,#1e1b4b_0%,transparent_50%)] pointer-events-none opacity-40" />
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
                            Immutable <span className="text-blue-500">Logs</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed text-balance">
                            Absolute data integrity for high-stakes industrial environments. Every sensor reading and system command is inscribed as a permanent, verifiable event on the Bitcoin SV network.
                        </p>

                        <div className="space-y-4">
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <FiShield className="text-blue-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Cryptographic Chain of Custody</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Continuous hashing ensures data remains linked and untampered from the edge device to the ledger.</p>
                                </div>
                            </div>
                            <div className="flex gap-5 p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <FiDatabase className="text-emerald-500 text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Ordinal Metadata</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">Unique sequence numbering at the protocol level guarantees the chronological order of industrial state changes.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative aspect-square rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <Image
                            src="/images/projects/robust-ae/industrial-control-3.jpg"
                            alt="Immutable Log Infrastructure"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                </div>

                <div className="prose prose-invert max-w-none">
                    <h2 className="text-3xl font-bold mb-8 text-white">Securing the Physical Layer</h2>
                    <p className="text-lg text-zinc-300 leading-relaxed mb-8">
                        Traditional SCADA siloed databases are vulnerable to deletion and correction. By integrating Robust AE's embedded controllers directly with the BSV blockchain, we eliminate the trust gap between physical events and digital records.
                    </p>

                    <div className="grid md:grid-cols-2 gap-12 my-20">
                        <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FiLink className="text-blue-500" /> Protocol-Native Indexing
                            </h4>
                            <p className="text-zinc-400 leading-relaxed">
                                Log entries are not just stored in a database; they are first-class objects on the network. This allows for public verification and cross-jurisdictional audits without compromising proprietary control logic.
                            </p>
                        </div>
                        <div className="p-10 bg-zinc-950 border border-zinc-900 rounded-3xl">
                            <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <FiDatabase className="text-emerald-500" /> Witness Data Integration
                            </h4>
                            <p className="text-zinc-400 leading-relaxed">
                                High-resolution telemetry is inscribed into the witness portion of the transaction, ensuring that the raw data is as immutable as the payment that recorded it.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}