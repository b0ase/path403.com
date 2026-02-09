
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import { pricingCategories } from "@/lib/pricing-data";
import { getContractTitle } from "@/lib/contract-titles";
import ContractForm from "./contract-form";

export default function ContractDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Find the service from pricing data
  const allServices = pricingCategories.flatMap(cat =>
    cat.items.map(item => {
      const categorySlug = cat.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const serviceSlug = item.service.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        id: `${categorySlug}-${serviceSlug}`,
        service: item.service,
        price: item.price,
        unit: item.unit,
        category: cat.category,
      };
    })
  );

  const service = allServices.find(s => s.id === slug);

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-600 font-mono text-sm uppercase mb-4">Contract not found</p>
          <Link
            href="/contracts"
            className="inline-block px-6 py-3 border border-zinc-800 text-zinc-500 text-xs font-mono uppercase hover:border-white hover:text-white transition-all"
          >
            ← Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  const title = getContractTitle(service.service);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Header */}
          <div className="mb-12">
            <Link
              href="/contracts"
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-sm font-mono uppercase mb-6 transition-colors"
            >
              <FiArrowLeft size={16} /> Back to Contracts
            </Link>

            <div className="border-b border-zinc-900 pb-8 mb-8">
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-green-900/20 border border-green-900 text-green-500 mb-4">
                    On-Chain Contract
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight uppercase">
                    {title}
                  </h1>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
                    Category: {service.category} · Provider: b0ase.com
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-4xl md:text-5xl font-bold text-white font-mono tracking-tighter mb-2">
                    {service.price}
                  </div>
                  <div className="text-xs text-zinc-600 uppercase font-mono tracking-widest">
                    {service.unit}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left: Contract Terms */}
            <div>
              <h2 className="text-xl font-bold uppercase mb-6 font-mono tracking-tight text-white">
                Contract Terms
              </h2>

              <div className="space-y-6">
                {/* Service Description */}
                <div className="p-6 border border-zinc-900 bg-zinc-950/50">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono mb-4 tracking-widest">
                    Service Offered
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    This contract governs the delivery of professional <strong>{service.service.toLowerCase()}</strong> services.
                    The provider (b0ase.com) agrees to deliver the specified work according to professional standards.
                    {service.unit === 'one-time' ? ' This is a fixed-price engagement.' : ` Services are billed ${service.unit}.`}
                  </p>
                </div>

                {/* What's Included */}
                <div className="p-6 border border-zinc-900 bg-zinc-950/50">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase font-mono mb-4 tracking-widest">
                    Deliverables
                  </h3>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                      <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Professional execution of {service.service.toLowerCase()}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Full transfer of Intellectual Property rights</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Standard revision cycles included</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <FiCheck className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                      <span>Final delivery of all source assets</span>
                    </li>
                  </ul>
                </div>

                {/* Payment & Guarantees */}
                <div className="p-6 border border-green-900/30 bg-green-900/5">
                  <h3 className="text-xs font-bold text-green-500 uppercase font-mono mb-4 tracking-widest">
                    Escrow & Guarantees
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-xs">01</span>
                      <div>
                        <strong className="text-white text-sm block mb-1">Smart Contract Escrow</strong>
                        <p className="text-xs text-zinc-400 leading-relaxed">Funds are locked in a verified smart contract and only released upon your approval of the deliverables.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-xs">02</span>
                      <div>
                        <strong className="text-white text-sm block mb-1">Verifiable Delivery</strong>
                        <p className="text-xs text-zinc-400 leading-relaxed">Proof of work is hashed and inscribed on-chain, creating an immutable record of completion.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 font-mono text-xs">03</span>
                      <div>
                        <strong className="text-white text-sm block mb-1">Dispute Resolution</strong>
                        <p className="text-xs text-zinc-400 leading-relaxed">Standard arbitration clause included. Jurisdiction: England & Wales.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Form */}
            <div>
              <div className="sticky top-8">
                <h2 className="text-xl font-bold uppercase mb-6 font-mono tracking-tight text-white">
                  Execute Contract
                </h2>

                <div className="border border-zinc-800 bg-zinc-900/20 p-1">
                  <ContractForm
                    service={service.service}
                    price={service.price}
                    unit={service.unit}
                    category={service.category}
                    slug={slug}
                  />
                </div>

                <div className="mt-8 p-6 border border-blue-900/30 bg-blue-900/5">
                  <h3 className="text-xs font-bold uppercase mb-3 text-blue-400 font-mono tracking-widest">
                    Process
                  </h3>
                  <div className="grid grid-cols-1 gap-4 text-xs text-zinc-400">
                    <p>1. Deploy Contract to Blockchain</p>
                    <p>2. Fund Escrow (BSV, ETH, SOL)</p>
                    <p>3. Work Begins Automatically</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
