'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiShield, FiCheckCircle, FiExternalLink,
  FiLinkedin, FiGlobe, FiFileText, FiBriefcase,
  FiSearch, FiTrendingUp, FiAward
} from 'react-icons/fi';

interface Founder {
  id: string;
  fullName: string;
  photo: string;
  title: string;
  linkedIn: string;
  linkedInVerified: boolean;
  companyName: string;
  ticker: string;
  companyNumber: string;
  companiesHouseUrl: string;
  incorporationStatus: 'incorporated' | 'pre-incorporated';
  jurisdiction: string;
  kycVerified: boolean;
  companyVerified: boolean;
  bio: string;
  sector: string;
  fundingStage: string;
  website?: string;
  isMock?: boolean;
}

// Demo founders - silly mock data (these are NOT real people or companies!)

const SECTORS = ['All', 'AI & Machine Learning', 'CleanTech', 'FinTech', 'HealthTech', 'Cybersecurity', 'EdTech'];
const STAGES = ['All', 'Pre-Seed', 'Seed', 'Series A'];

export default function FoundersPage() {
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const REAL_FOUNDERS: Founder[] = [
    {
      id: "richard-boase",
      fullName: "Richard Boase",
      photo: "/images/blog/richard-boase.jpg",
      title: "Founder & CEO, b0ase.com",
      linkedIn: "https://www.linkedin.com/in/richardboase/",
      linkedInVerified: true,
      companyName: "b0ase.com",
      ticker: "$BOASE",
      companyNumber: "N/A",
      companiesHouseUrl: "https://find-and-update.company-information.service.gov.uk/",
      incorporationStatus: "incorporated",
      jurisdiction: "United Kingdom",
      kycVerified: true,
      companyVerified: true,
      bio: "Serial founder and full-stack developer specializing in Bitcoin SV and AI-powered applications. Building the future of digital asset management and autonomous software.",
      sector: "FinTech & AI",
      fundingStage: "Revenue",
      website: "https://b0ase.com",
      isMock: false,
    }
  ];

  const filteredFounders = REAL_FOUNDERS.filter(founder => {
    const matchesSector = selectedSector === 'All' || founder.sector === selectedSector;
    const matchesStage = selectedStage === 'All' || founder.fundingStage === selectedStage;
    const matchesSearch = founder.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      founder.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      founder.bio.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesStage && matchesSearch;
  });

  const verifiedCount = REAL_FOUNDERS.filter(f => f.kycVerified && f.companyVerified).length;
  const incorporatedCount = REAL_FOUNDERS.filter(f => f.incorporationStatus === 'incorporated').length;

  return (
    <motion.div
      className="min-h-screen bg-black text-white relative font-mono selection:bg-white selection:text-black"
      data-theme="dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Header */}
        <motion.div
          className="mb-12 border-b border-gray-800 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
            <div className="bg-gray-900/50 p-4 md:p-6 border border-gray-800 self-start">
              <FiBriefcase className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                FOUNDERS
              </h1>
              <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                VERIFIED DIRECTORS
              </div>
            </div>
          </div>

          <p className="text-gray-400 max-w-2xl mb-8">
            The b0ase exchange lists vetted founders who have passed rigorous identity and business
            verification. Build trust with your investors through absolute transparency.
          </p>
        </motion.div>

        {/* Become a Founder CTA - NOW AT TOP */}
        <div className="bg-emerald-900/10 border border-emerald-500/30 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-3">
                <FiShield className="text-emerald-400 text-xl" />
                <h2 className="text-xl font-bold uppercase tracking-tight">Become a Listed Founder</h2>
              </div>
              <p className="text-zinc-500 text-sm">
                Get verified and listed on b0ase. Full KYC, LinkedIn verification, and Companies House
                registration required.
              </p>
            </div>
            <Link
              href="/contact?subject=Founder%20Listing"
              className="px-8 py-4 bg-emerald-600 text-white font-bold uppercase tracking-wider text-sm hover:bg-emerald-500 transition-colors whitespace-nowrap"
            >
              Apply for Verification
            </Link>
          </div>
        </div>

        {/* What We Verify - NOW AT TOP */}
        <div className="bg-black border border-zinc-800 mb-12">
          <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Verification_Requirements</span>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-zinc-800">
            {[
              { title: 'Identity (KYC)', desc: 'Government ID + proof of address verification', icon: <FiShield className="text-emerald-400" /> },
              { title: 'LinkedIn Profile', desc: 'Real professional history and connections', icon: <FiLinkedin className="text-blue-400" /> },
              { title: 'Company Registration', desc: 'Companies House incorporation docs', icon: <FiFileText className="text-amber-400" /> },
              { title: 'Director Confirmation', desc: 'PSC register and director filings', icon: <FiUser className="text-purple-400" /> },
              { title: 'Bank Account', desc: 'UK business bank account verification', icon: <FiBriefcase className="text-cyan-400" /> },
              { title: 'Ongoing Compliance', desc: 'Annual return and accounts filed', icon: <FiCheckCircle className="text-pink-400" /> },
            ].map((item, i) => (
              <div key={i} className="bg-black p-4 flex items-start gap-3">
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight mb-1">{item.title}</h4>
                  <p className="text-zinc-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              placeholder="Search founders, companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-zinc-800 pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-black border border-zinc-800 px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-white"
            >
              <option value="All">All Sectors</option>
              {SECTORS.filter(s => s !== 'All').map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Founders Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredFounders.map((founder) => (
            <div
              key={founder.id}
              className="bg-black border border-zinc-800 p-6 hover:border-zinc-500 transition-all group"
            >
              {/* Founder Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 border border-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {founder.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-bold text-white uppercase tracking-tight">{founder.fullName}</h3>
                    <FiCheckCircle className="text-emerald-400" size={14} />
                  </div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{founder.title}</p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed mb-6 h-12 line-clamp-3">{founder.bio}</p>

              {/* Company Info */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-white uppercase tracking-tight">{founder.companyName}</span>
                  <span className="text-xs text-emerald-400 font-mono tracking-tighter">{founder.ticker}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-0.5 border border-emerald-500/20 text-emerald-400 text-[10px] uppercase">
                    Incorporated
                  </span>
                  <span className="px-2 py-0.5 border border-zinc-800 text-zinc-500 text-[10px] uppercase">
                    UK
                  </span>
                </div>

                <a
                  href={founder.companiesHouseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-500 flex items-center gap-2 hover:text-amber-400"
                >
                  <FiFileText size={12} />
                  COMPANIES HOUSE VERIFIED
                  <FiExternalLink size={10} />
                </a>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <div className="flex gap-4">
                  <a href={founder.linkedIn} className="text-zinc-500 hover:text-blue-400"><FiLinkedin size={18} /></a>
                  {founder.website && <a href={founder.website} className="text-zinc-500 hover:text-white"><FiGlobe size={18} /></a>}
                </div>
                <Link
                  href={`/contact?founder=${founder.id}`}
                  className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Links */}
        <div className="flex gap-6 justify-center flex-wrap pt-12 border-t border-zinc-800">
          <Link href="/developers" className="text-xs text-zinc-500 uppercase tracking-widest hover:text-white">Developers</Link>
          <Link href="/exchange" className="text-xs text-zinc-500 uppercase tracking-widest hover:text-white">Exchange</Link>
          <Link href="/kintsugi" className="text-xs text-zinc-500 uppercase tracking-widest hover:text-white">Kintsugi Engine</Link>
        </div>
      </motion.section>
    </motion.div>
  );
}
