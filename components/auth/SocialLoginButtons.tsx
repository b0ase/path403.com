'use client';

import React from 'react';
import { FaGoogle, FaGithub, FaTwitter, FaLinkedin, FaDiscord, FaWallet } from 'react-icons/fa';
import { SiHandshake } from 'react-icons/si'; // Placeholder for HandCash/Yours if specific icons not available
import Image from 'next/image';

interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    provider: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
}

const CryptoButton = ({ icon, provider, onClick, className = '' }: { icon: React.ReactNode, provider: string, onClick?: () => void, className?: string }) => (
    <button
        onClick={onClick}
        className={`group relative flex items-center justify-between w-full p-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900/50 dark:hover:bg-zinc-800 border border-zinc-300 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 rounded-xl transition-all duration-300 overflow-hidden ${className}`}
    >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 dark:via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white dark:bg-black/50 flex items-center justify-center text-xl shadow-inner">
                {icon}
            </div>
            <span className="font-medium text-zinc-700 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors">{provider}</span>
        </div>
        <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
        </div>
    </button>
);

const SocialButton = ({ icon, provider, onClick }: { icon: React.ReactNode, provider: string, onClick?: () => void }) => (
    <button
        onClick={onClick}
        className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-300 hover:border-zinc-400 dark:border-white/5 dark:hover:border-white/20 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all duration-200"
    >
        <span className="text-base">{icon}</span>
        <span className="truncate">{provider}</span>
    </button>
);

export const SocialLoginButtons = () => {
    const handleLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        // Implement login logic here
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-3">

            {/* Row 1: Sign In - Social Logins (all in one row) */}
            <div className="space-y-1">
                <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1">Sign In</h3>
                <div className="flex gap-1.5">
                    <SocialButton icon={<FaGoogle className="text-red-500" />} provider="Google" onClick={() => handleLogin('Google')} />
                    <SocialButton icon={<FaGithub className="text-zinc-800 dark:text-white" />} provider="GitHub" onClick={() => handleLogin('GitHub')} />
                    <SocialButton icon={<FaTwitter className="text-blue-400" />} provider="Twitter" onClick={() => handleLogin('Twitter')} />
                    <SocialButton icon={<FaLinkedin className="text-blue-600" />} provider="LinkedIn" onClick={() => handleLogin('LinkedIn')} />
                    <SocialButton icon={<FaDiscord className="text-indigo-500" />} provider="Discord" onClick={() => handleLogin('Discord')} />
                </div>
            </div>

            {/* Row 2: Connect Wallet (all in one row) */}
            <div className="space-y-1">
                <h3 className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider px-1">Then Connect Wallet</h3>
                <div className="flex gap-1.5">
                    <CryptoButton icon={<span className="text-green-500 font-bold text-xs">H</span>} provider="Hand" onClick={() => handleLogin('HandCash')} className="!p-2 flex-1" />
                    <CryptoButton icon={<span className="text-blue-500 font-bold text-xs">Y</span>} provider="Yours" onClick={() => handleLogin('Yours Wallet')} className="!p-2 flex-1" />
                    <CryptoButton icon={<span className="text-purple-500 text-xs"><FaWallet /></span>} provider="Phantom" onClick={() => handleLogin('Phantom')} className="!p-2 flex-1" />
                    <CryptoButton icon={<span className="text-orange-500 text-xs"><FaWallet /></span>} provider="Meta" onClick={() => handleLogin('MetaMask')} className="!p-2 flex-1" />
                </div>
            </div>
        </div>
    );
};

export default SocialLoginButtons;
