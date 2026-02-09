import ScadaCard from '../../../components/ScadaCard';
import Link from 'next/link';
import { FiArrowLeft, FiShield, FiZap, FiActivity, FiGlobe, FiCpu, FiDatabase } from 'react-icons/fi';

const scadaCards = [
    {
        title: "Immutable Logs and Data Integrity",
        description: "Leverage blockchain's distributed ledger for immutable, tamper-proof logs of SCADA operational data, ensuring unparalleled integrity and auditability.",
        href: "/tools/scada/immutable-logs",
        icon: <FiDatabase />
    },
    {
        title: "Pay-to-Switch Mechanisms",
        description: "Implement secure 'pay-to-switch' functionalities via smart contracts, enabling auditable execution of critical control actions upon payment verification.",
        href: "/tools/scada/pay-to-switch",
        icon: <FiZap />
    },
    {
        title: "Automated Triggers and Smart Contracts",
        description: "Use blockchain smart contracts to automate SCADA operations, triggering system changes like lockdowns or rerouting based on verified conditions.",
        href: "/tools/scada/automated-triggers",
        icon: <FiActivity />
    },
    {
        title: "Enhanced Security Infrastructure",
        description: "Blockchain provides a robust, decentralized security layer for SCADA, securing communication and authenticating edge devices on the network.",
        href: "/tools/scada/enhanced-security",
        icon: <FiShield />
    },
    {
        title: "Cities on Chain",
        description: "Transform urban infrastructure with integrated SCADA systems, enabling automated city operations and utility-as-a-service provisioning.",
        href: "/tools/scada/cities-on-chain",
        icon: <FiGlobe />
    },
    {
        title: "Decentralized Operations",
        description: "Enable fully decentralized SCADA operations, allowing for autonomous decision-making and transparency in governance without central failure points.",
        href: "/tools/scada/decentralized-operations",
        icon: <FiCpu />
    },
];

export default function ScadaPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-black pointer-events-none" />
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none opacity-10 brightness-50" />

            <div className="relative z-10 p-8 md:p-16 max-w-pillar mx-auto">
                <Link
                    href="/tools"
                    className="inline-flex items-center gap-2 text-zinc-800 hover:text-white text-[10px] uppercase tracking-widest mb-12 transition-colors font-mono"
                >
                    &larr; protocol_suite
                </Link>

                <div className="mb-20 space-y-4">
                    <h1 className="text-4xl md:text-8xl font-black uppercase tracking-tighter mb-2">
                        SCADA<span className="text-zinc-800">.OPS</span>
                    </h1>
                    <p className="text-zinc-500 uppercase text-xs tracking-widest">
                        Industrial Orchestration Protocol & Ledger Integration
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scadaCards.map((card) => (
                        <ScadaCard key={card.title} {...card} />
                    ))}
                </div>

                <div className="mt-32 p-12 rounded-pillar bg-zinc-950/20 border border-zinc-900 border-dashed flex flex-col items-center text-center">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-4">Industrial_Integrations</h2>
                    <p className="text-zinc-500 mb-8 max-w-xl text-[10px] uppercase tracking-tighter leading-relaxed">
                        Robust Engineering provides the hardware bridge and protocol layer required to connect legacy industrial systems to the global ledger.
                    </p>
                    <Link
                        href="/work/consultancy"
                        className="px-8 py-4 bg-white text-black rounded-pillar font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all"
                    >
                        INIT_CONSULTANCY
                    </Link>
                </div>
            </div>
        </div>
    );
}