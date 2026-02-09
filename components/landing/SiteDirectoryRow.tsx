'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiCpu, FiSmartphone, FiZap, FiBook, FiUsers, FiCode, FiCircle,
    FiBriefcase, FiBox, FiFileText, FiFile, FiPenTool, FiTerminal,
    FiTrendingUp, FiPieChart, FiShoppingCart, FiPackage, FiGrid,
    FiDollarSign, FiMap, FiLayers, FiSettings, FiVideo, FiDisc,
    FiTool, FiLayout, FiSend, FiStar
} from 'react-icons/fi';
import { useColorTheme } from '@/components/ThemePicker';

// Match navbar links exactly
const sitePages = [
    { name: 'AGENTS', path: '/agents', icon: FiCpu },
    { name: 'APPS', path: '/apps', icon: FiSmartphone },
    { name: 'AUTOMATION', path: '/automation', icon: FiZap },
    { name: 'BLOG', path: '/blog', icon: FiBook },
    { name: 'BOARDROOM', path: '/boardroom', icon: FiUsers },
    { name: 'BUILD', path: '/build', icon: FiCode },
    { name: 'BUTTONS', path: '/buttons', icon: FiCircle },
    { name: 'CLIENTS', path: '/client', icon: FiBriefcase },
    { name: 'COMPONENTS', path: '/components', icon: FiBox },
    { name: 'CONTENT', path: '/content', icon: FiFileText },
    { name: 'CONTRACTS', path: '/contracts', icon: FiFile },
    { name: 'CREATIVE', path: '/creative', icon: FiPenTool },
    { name: 'DEVELOPERS', path: '/developers', icon: FiTerminal },
    { name: 'EXCHANGE', path: '/exchange', icon: FiTrendingUp },
    { name: 'INVESTORS', path: '/investors', icon: FiPieChart },
    { name: 'KINTSUGI', path: '/kintsugi', icon: FiStar },
    { name: 'MARKET', path: '/market', icon: FiShoppingCart },
    { name: 'MINT', path: '/mint', icon: FiPackage },
    { name: 'PORTFOLIO', path: '/portfolio', icon: FiGrid },
    { name: 'PRICING', path: '/pricing', icon: FiDollarSign },
    { name: 'ROADMAP', path: '/roadmap', icon: FiMap },
    { name: 'SCHEMATICS', path: '/schematics', icon: FiLayers },
    { name: 'SERVICES', path: '/services', icon: FiSettings },
    { name: 'STUDIO', path: '/studio', icon: FiVideo },
    { name: 'TOKENS', path: '/tokens', icon: FiDisc },
    { name: 'TOOLS', path: '/tools', icon: FiTool },
    { name: 'WEBSITES', path: '/websites', icon: FiLayout },
];

export default function SiteDirectoryRow({ isVisible = true }: { isVisible?: boolean }) {
    const { colorTheme } = useColorTheme();
    const isLightTheme = colorTheme === 'white';
    const isColoredMode = ['red', 'green', 'blue', 'yellow', 'pink'].includes(colorTheme);

    // Get contrasting colors for each color mode
    const getColorModeStyles = () => {
        switch (colorTheme) {
            case 'red':
                return {
                    text: 'text-yellow-300',
                    border: 'border-yellow-400/50',
                    hoverBorder: 'rgba(250, 204, 21, 0.7)',
                    bg: 'bg-black/20'
                };
            case 'green':
                return {
                    text: 'text-white',
                    border: 'border-white/40',
                    hoverBorder: 'rgba(255, 255, 255, 0.7)',
                    bg: 'bg-black/20'
                };
            case 'blue':
                return {
                    text: 'text-cyan-200',
                    border: 'border-cyan-300/50',
                    hoverBorder: 'rgba(103, 232, 249, 0.7)',
                    bg: 'bg-black/20'
                };
            case 'yellow':
                return {
                    text: 'text-purple-900',
                    border: 'border-purple-900/40',
                    hoverBorder: 'rgba(88, 28, 135, 0.6)',
                    bg: 'bg-white/20'
                };
            case 'pink':
                return {
                    text: 'text-white',
                    border: 'border-white/40',
                    hoverBorder: 'rgba(255, 255, 255, 0.7)',
                    bg: 'bg-black/20'
                };
            default:
                return null;
        }
    };

    const colorStyles = getColorModeStyles();

    return (
        <div className="w-full relative z-50 py-4">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-1.5 md:gap-2">
                {sitePages.map((page, i) => (
                    <Link key={page.path} href={page.path} className="block">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                            transition={{ delay: i * 0.02, duration: 0.3 }}
                            whileHover={{
                                borderColor: isColoredMode && colorStyles
                                    ? colorStyles.hoverBorder
                                    : isLightTheme
                                    ? 'rgba(0, 0, 0, 0.4)'
                                    : 'rgba(255, 255, 255, 0.4)',
                                boxShadow: isColoredMode
                                    ? '0 4px 15px rgba(0,0,0,0.2)'
                                    : isLightTheme
                                    ? '0 4px 20px rgba(0,0,0,0.15), 0 0 10px rgba(0,0,0,0.08)'
                                    : '0 4px 20px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.08)',
                                y: -2
                            }}
                            className={`flex items-center justify-center gap-1.5 w-full px-2 py-2 text-[10px] md:text-[11px] font-mono font-bold tracking-wide transition-all duration-200 cursor-pointer rounded-lg ${
                                isColoredMode && colorStyles
                                    ? `${colorStyles.text} ${colorStyles.bg} ${colorStyles.border}`
                                    : isLightTheme
                                    ? 'text-black bg-white border border-zinc-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                                    : 'text-white bg-black border border-zinc-800 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
                                }`}
                        >
                            <page.icon size={12} className="flex-shrink-0" />
                            <span className="truncate">{page.name}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
