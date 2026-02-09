'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    FiUsers, FiStar, FiAward, FiCheck, FiArrowRight,
    FiCode, FiZap, FiDollarSign, FiTrendingUp, FiPlus
} from 'react-icons/fi';
import { FaBitcoin, FaHandshake } from 'react-icons/fa';

interface Tutor {
    id: string;
    rank: number;
    name: string;
    handle: string;
    token?: string;
    tokenPrice?: string;
    specialties: string[];
    rate: string;
    sessionsCompleted: number;
    rating: number;
    tokenHolders?: number;
    verified: boolean;
}

const TUTORS_LEADERBOARD: Tutor[] = [
    {
        id: 'richard-boase',
        rank: 1,
        name: 'Richard Boase',
        handle: '$BOASE',
        tokenPrice: '$0.01',
        specialties: ['Next.js', 'BSV/Bitcoin', 'Claude Code', 'AI Development'],
        rate: '$50/hr',
        sessionsCompleted: 50,
        rating: 5,
        tokenHolders: 120,
        verified: true,
    },
    // More tutors can be added here as they join
];

const BENEFITS = [
    {
        icon: FiDollarSign,
        title: 'Earn Teaching',
        description: 'Set your own rates and get paid for 1:1 sessions',
    },
    {
        icon: FiZap,
        title: 'Mint Your Token',
        description: 'Create a personal token that represents your teaching brand',
    },
    {
        icon: FiTrendingUp,
        title: 'Build Reputation',
        description: 'Climb the leaderboard and attract more students',
    },
    {
        icon: FiUsers,
        title: 'Join the Network',
        description: 'Be part of the Kintsugi developer community',
    },
];

const REQUIREMENTS = [
    'Experience with at least one area: Next.js, React, BSV, AI Development, or related technologies',
    'HandCash wallet for payments (we help set this up)',
    'Ability to communicate clearly via video calls',
    'Commitment to at least 5 hours/week availability',
];

export default function TutorsPage() {
    const [showSignupInfo, setShowSignupInfo] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-purple-900/30 via-black to-green-900/20 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative container mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-sm mb-6">
                            <FiAward className="animate-pulse" />
                            <span>Tutor Network</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                            <span className="text-purple-400">TUTORS</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
                            Join the Kintsugi tutor network. Teach what you know, earn tokens,
                            and help the next generation of vibe-coders level up.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="#leaderboard"
                                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                            >
                                View Leaderboard
                            </a>
                            <a
                                href="#signup"
                                className="px-6 py-3 border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 font-bold rounded-lg transition-colors"
                            >
                                Become a Tutor
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFITS.map((benefit, idx) => (
                        <div key={idx} className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-purple-500/30 transition-colors">
                            <benefit.icon className="text-3xl text-purple-400 mb-4" />
                            <h3 className="font-bold text-white mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-400">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div id="leaderboard" className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Tutor Leaderboard</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Top tutors ranked by sessions, ratings, and token holders.
                        Climb the ranks to increase your visibility.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-900 border border-gray-800 rounded-t-lg text-xs text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">#</div>
                        <div className="col-span-4">Tutor</div>
                        <div className="col-span-2">Token</div>
                        <div className="col-span-2 text-center">Sessions</div>
                        <div className="col-span-2 text-center">Rating</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Tutor Rows */}
                    {TUTORS_LEADERBOARD.map((tutor) => (
                        <div key={tutor.id} className="grid grid-cols-12 gap-4 p-4 bg-gray-900/50 border border-gray-800 border-t-0 items-center hover:bg-gray-900/80 transition-colors">
                            <div className="col-span-1">
                                <span className={`text-lg font-bold ${tutor.rank === 1 ? 'text-amber-400' : tutor.rank === 2 ? 'text-gray-300' : tutor.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                                    {tutor.rank}
                                </span>
                            </div>
                            <div className="col-span-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">{tutor.name}</span>
                                    {tutor.verified && (
                                        <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                                            ✓
                                        </span>
                                    )}
                                </div>
                                <p className="text-green-400 font-mono text-xs">{tutor.handle}</p>
                            </div>
                            <div className="col-span-2">
                                {tutor.token ? (
                                    <div>
                                        <span className="text-amber-400 font-mono text-sm">{tutor.token}</span>
                                        {tutor.tokenPrice && (
                                            <p className="text-gray-500 text-xs">{tutor.tokenPrice}</p>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-gray-600">—</span>
                                )}
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="text-white font-bold">{tutor.sessionsCompleted}</span>
                            </div>
                            <div className="col-span-2 text-center">
                                <span className="flex items-center justify-center gap-1 text-amber-400">
                                    <FiStar size={12} />
                                    {tutor.rating}/5
                                </span>
                            </div>
                            <div className="col-span-1 text-right">
                                <Link
                                    href={`/contact?subject=Book%20Tutoring%20with%20${tutor.name}`}
                                    className="text-purple-400 hover:text-purple-300"
                                >
                                    <FiArrowRight />
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {TUTORS_LEADERBOARD.length < 5 && (
                        <div className="p-8 bg-gray-900/30 border border-gray-800 border-t-0 rounded-b-lg text-center">
                            <p className="text-gray-500 mb-4">More spots available on the leaderboard</p>
                            <a href="#signup" className="text-purple-400 hover:text-purple-300 font-bold flex items-center justify-center gap-2">
                                <FiPlus />
                                Apply to become a tutor
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Signup Section */}
            <div id="signup" className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Become a Tutor</h2>
                        <p className="text-gray-400">
                            Join the network, set your rates, and start teaching.
                            Optionally mint your own token to let students invest in your success.
                        </p>
                    </div>

                    <div className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-8">
                        <h3 className="text-xl font-bold mb-4">Requirements</h3>
                        <ul className="space-y-3 mb-8">
                            {REQUIREMENTS.map((req, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                                    <FiCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                                    {req}
                                </li>
                            ))}
                        </ul>

                        <h3 className="text-xl font-bold mb-4">How It Works</h3>
                        <ol className="space-y-4 mb-8 text-sm text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                <span>Apply by contacting us with your background and availability</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                <span>We review your application and schedule a short intro call</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                <span>Set up your HandCash wallet and optionally mint your tutor token</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                <span>Get listed on the tutor page and start accepting sessions</span>
                            </li>
                        </ol>

                        <Link
                            href="/contact?subject=Apply%20to%20Become%20a%20Tutor"
                            className="block w-full text-center px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                        >
                            Apply Now
                        </Link>
                    </div>
                </div>
            </div>

            {/* Token Info */}
            <div className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="max-w-2xl mx-auto text-center">
                    <FaBitcoin className="text-5xl text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4">Tutor Tokens</h2>
                    <p className="text-gray-400 mb-8">
                        As a tutor, you can mint your own BSV-20 token (e.g., $YOURNAME).
                        Students can buy your token to support you, and token holders may get
                        perks like priority booking or discounted rates.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                            <p className="text-amber-400 font-bold mb-1">Tradeable</p>
                            <p className="text-gray-500">Your token trades on 1SatOrdinals</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                            <p className="text-amber-400 font-bold mb-1">Builds Value</p>
                            <p className="text-gray-500">Token price reflects your reputation</p>
                        </div>
                        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
                            <p className="text-amber-400 font-bold mb-1">Aligns Incentives</p>
                            <p className="text-gray-500">Holders want you to succeed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Teach?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Join the network and start earning by sharing your knowledge.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact?subject=Apply%20to%20Become%20a%20Tutor"
                            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
                        >
                            Apply Now
                        </Link>
                        <Link
                            href="/book-a-tutor"
                            className="px-6 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white font-bold rounded-lg transition-colors"
                        >
                            Book a Session
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
