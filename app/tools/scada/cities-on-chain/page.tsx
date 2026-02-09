import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiMap, FiActivity, FiUsers, FiHexagon } from 'react-icons/fi';

export default function CitiesOnChainPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#3b0764_0%,transparent_50%)] pointer-events-none opacity-40" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none opacity-20 brightness-100 contrast-150" />

            <div className="relative z-10 p-8 md:p-16 max-w-7xl mx-auto">
                <Link
                    href="/tools/scada"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm mb-12 transition-colors font-mono"
                >
                    <FiArrowLeft />
                    Back to SCADA Tools
                </Link>

                <div className="mb-24 text-center">
                    <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tighter">
                        Cities on <span className="text-purple-500">Chain</span>
                    </h1>
                    <p className="text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        Transforming urban infrastructure into a programmable, transparent, and citizen-centric ecosystem via Robust AE hardware.
                    </p>
                </div>

                <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-zinc-800 shadow-2xl mb-24">
                    <Image
                        src="/images/projects/robust-ae/environmental-monitor-2.jpg"
                        alt="Smart City Environmental Control"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 flex flex-wrap gap-4">
                        <div className="px-6 py-2 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-400 text-sm font-bold backdrop-blur-xl">Smart Grids</div>
                        <div className="px-6 py-2 bg-blue-500/20 border border-blue-500/40 rounded-full text-blue-400 text-sm font-bold backdrop-blur-xl">Water Management</div>
                        <div className="px-6 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-400 text-sm font-bold backdrop-blur-xl">Urban Air Quality</div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div className="p-12 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 group hover:border-purple-500/30 transition-colors">
                        <FiMap className="text-purple-500 text-3xl mb-8" />
                        <h2 className="text-3xl font-bold mb-6 text-white">Cities as a Service (CaaS)</h2>
                        <p className="text-lg text-zinc-400 leading-relaxed">
                            CaaS emerges when urban utilities are tokenized and managed as modular on-chain assets. Robust AE's systems provide the physical bridge, allowing for Pay-to-Switch utility access for businesses and individuals alike.
                        </p>
                    </div>
                    <div className="p-12 rounded-[2.5rem] bg-zinc-950 border border-zinc-900 group hover:border-blue-500/30 transition-colors">
                        <FiUsers className="text-blue-500 text-3xl mb-8" />
                        <h2 className="text-3xl font-bold mb-6 text-white">Public Governance</h2>
                        <p className="text-lg text-zinc-400 leading-relaxed">
                            Every state change in the city's infrastructure is inscribed on the ledger. This creates an unprecedented level of public oversight, making urban management auditable by the citizens it serves.
                        </p>
                    </div>
                </div>

                <div className="relative p-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl overflow-hidden mb-24">
                    <div className="bg-black rounded-[1.4rem] p-12 flex flex-col items-center text-center">
                        <FiHexagon className="text-purple-500 animate-spin-slow text-4xl mb-8" />
                        <h3 className="text-3xl font-bold mb-6 text-white">Real-Time Urban Optimization</h3>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl">
                            Using Robust AE controllers and smart contracts, cities can autonomously adjust resource allocation based on real-time environmental demand, reducing industrial waste and improving urban quality of life.
                        </p>
                    </div>
                </div>

                <p className="text-xl text-zinc-500 leading-relaxed text-center italic">
                    "Building the resilient, equitable, and programmable urban futures of 2026."
                </p>
            </div>
        </div>
    );
}