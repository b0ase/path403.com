'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    FiUsers, FiCheck, FiClock, FiDollarSign, FiCalendar,
    FiCode, FiZap, FiShield, FiChevronDown, FiChevronUp,
    FiStar, FiMessageCircle, FiVideo
} from 'react-icons/fi';
import { FaHandshake, FaBitcoin } from 'react-icons/fa';

interface Tutor {
    id: string;
    name: string;
    handle: string;
    token?: string;
    avatar?: string;
    specialties: string[];
    rate: string;
    availability: string;
    sessionsCompleted: number;
    rating: number;
    bio: string;
    verified: boolean;
}

const TUTORS: Tutor[] = [
    {
        id: 'richard-boase',
        name: 'Richard Boase',
        handle: '$BOASE',
        specialties: ['Next.js', 'BSV/Bitcoin', 'Claude Code', 'AI Development', 'Full Stack'],
        rate: '$50/hr',
        availability: 'Flexible',
        sessionsCompleted: 50,
        rating: 5,
        bio: 'Full-stack developer and b0ase.com founder. Expert in AI-assisted development, Bitcoin integration, and building production applications.',
        verified: true,
    },
    {
        id: 'coming-soon-1',
        name: 'More Tutors Coming',
        handle: '$TUTOR',
        specialties: ['Various', 'Sign up to be listed'],
        rate: 'TBD',
        availability: 'TBD',
        sessionsCompleted: 0,
        rating: 0,
        bio: 'We\'re onboarding more tutors. Sign up at /tutors to join the network.',
        verified: false,
    },
];

const FEATURES = [
    { icon: FiVideo, title: '1:1 Video Calls', description: 'Private sessions via Zoom or Google Meet' },
    { icon: FiCode, title: 'Screen Sharing', description: 'Code together in real-time' },
    { icon: FiMessageCircle, title: 'Async Support', description: 'Follow-up questions between sessions' },
    { icon: FiShield, title: 'Vetted Tutors', description: 'All tutors verified by b0ase team' },
];

const FAQ = [
    {
        q: 'How do sessions work?',
        a: 'Book a session, receive a calendar invite, join the video call. Your tutor will help with whatever you need - debugging, learning concepts, code review, or project guidance.',
    },
    {
        q: 'What payment methods are accepted?',
        a: 'We accept credit/debit cards via Stripe and cryptocurrency via HandCash (BSV). Some tutors may accept other payment methods.',
    },
    {
        q: 'Can I become a tutor?',
        a: 'Yes! Visit /tutors to sign up. You can mint your own tutor token and get listed on the marketplace.',
    },
    {
        q: 'What if I\'m not satisfied?',
        a: 'If your first session doesn\'t meet expectations, we\'ll refund your payment or match you with a different tutor.',
    },
];

export default function BookATutorPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-green-900/30 via-black to-purple-900/20 py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative container mx-auto px-6">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm mb-6">
                            <FiUsers className="animate-pulse" />
                            <span>1:1 Mentorship</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                            BOOK A <span className="text-green-400">TUTOR</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-8 leading-relaxed max-w-2xl mx-auto">
                            Get unstuck fast with personalized 1:1 sessions from Kintsugi developers.
                            Setup help, code review, Bitcoin integration, AI development—whatever you need.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FiVideo className="text-green-400" />
                                <span>Video Sessions</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <FiClock className="text-green-400" />
                                <span>Flexible Scheduling</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <FaBitcoin className="text-amber-400" />
                                <span>Pay with Crypto</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="#tutors"
                                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
                            >
                                Browse Tutors
                            </a>
                            <Link
                                href="/tutors"
                                className="px-6 py-3 border border-green-500/50 text-green-400 hover:bg-green-500/10 font-bold rounded-lg transition-colors"
                            >
                                Become a Tutor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {FEATURES.map((feature, idx) => (
                        <div key={idx} className="p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
                            <feature.icon className="text-3xl text-green-400 mb-4" />
                            <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tutors List */}
            <div id="tutors" className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Available Tutors</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Choose a tutor that fits your learning goals. All tutors are verified members of the Kintsugi network.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {TUTORS.map((tutor) => (
                        <div key={tutor.id} className={`bg-gray-900/50 border rounded-lg overflow-hidden ${tutor.verified ? 'border-green-500/30' : 'border-gray-800'}`}>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold">{tutor.name}</h3>
                                            {tutor.verified && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-green-400 font-mono text-sm">{tutor.handle}</p>
                                        {tutor.token && (
                                            <p className="text-amber-400 font-mono text-xs mt-1">Token: {tutor.token}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-white">{tutor.rate}</p>
                                        <p className="text-xs text-gray-500">{tutor.availability}</p>
                                    </div>
                                </div>

                                <p className="text-gray-400 text-sm mb-4">{tutor.bio}</p>

                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {tutor.specialties.map((specialty) => (
                                        <span key={specialty} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded">
                                            {specialty}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4 text-gray-500">
                                        {tutor.rating > 0 && (
                                            <span className="flex items-center gap-1">
                                                <FiStar className="text-amber-400" />
                                                {tutor.rating}/5
                                            </span>
                                        )}
                                        {tutor.sessionsCompleted > 0 && (
                                            <span>{tutor.sessionsCompleted} sessions</span>
                                        )}
                                    </div>
                                    {tutor.verified && (
                                        <Link
                                            href={`/contact?subject=Book%20Tutoring%20with%20${tutor.name}`}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-bold rounded transition-colors text-xs"
                                        >
                                            Book Session
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <Link
                        href="/tutors"
                        className="text-green-400 hover:text-green-300 font-bold flex items-center justify-center gap-2"
                    >
                        <FiUsers />
                        View all tutors & sign up to teach
                    </Link>
                </div>
            </div>

            {/* Pricing */}
            <div className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
                        <p className="text-gray-400">Pay per session. No subscriptions.</p>
                    </div>

                    <div className="bg-gray-900/50 border border-green-500/30 rounded-lg p-8 text-center">
                        <p className="text-6xl font-black text-white mb-2">$50</p>
                        <p className="text-gray-500 mb-6">per hour</p>
                        <ul className="space-y-3 mb-8 text-left max-w-sm mx-auto">
                            <li className="flex items-center gap-3 text-gray-300">
                                <FiCheck className="text-green-400 flex-shrink-0" />
                                1:1 video session with screen sharing
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FiCheck className="text-green-400 flex-shrink-0" />
                                Any topic: setup, code review, debugging
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FiCheck className="text-green-400 flex-shrink-0" />
                                Pay with card or crypto
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <FiCheck className="text-green-400 flex-shrink-0" />
                                Recording available on request
                            </li>
                        </ul>
                        <Link
                            href="/contact?subject=Book%20Tutoring%20Session"
                            className="inline-block w-full max-w-sm px-6 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
                        >
                            Book a Session
                        </Link>
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-center">FAQ</h2>
                    <div className="space-y-4">
                        {FAQ.map((item, idx) => (
                            <div key={idx} className="border border-gray-800 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-4 text-left flex items-center justify-between bg-gray-900/50 hover:bg-gray-900 transition-colors"
                                >
                                    <span className="font-bold">{item.q}</span>
                                    {openFaq === idx ? <FiChevronUp /> : <FiChevronDown />}
                                </button>
                                {openFaq === idx && (
                                    <div className="p-4 text-gray-400 text-sm border-t border-gray-800">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-6 py-16 border-t border-gray-800">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Level Up?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Book your first session and get personalized guidance from experienced developers.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/contact?subject=Book%20Tutoring%20Session"
                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
                        >
                            Book a Session
                        </Link>
                        <Link
                            href="/courses"
                            className="px-6 py-3 border border-gray-600 text-gray-300 hover:border-white hover:text-white font-bold rounded-lg transition-colors"
                        >
                            Free Courses
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
