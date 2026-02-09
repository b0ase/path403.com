'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type DesignPillar = 'industrial' | 'balanced' | 'modern';

interface DesignPillarContextType {
    pillar: DesignPillar;
    setPillar: (pillar: DesignPillar) => void;
    togglePillar: () => void;
}

const DesignPillarContext = createContext<DesignPillarContextType | undefined>(undefined);

export function DesignPillarProvider({ children }: { children: React.ReactNode }) {
    const [pillar, setPillarState] = useState<DesignPillar>('industrial');

    // Initialize from localStorage
    useEffect(() => {
        const savedPillar = localStorage.getItem('b0ase-design-pillar') as DesignPillar;
        if (savedPillar === 'modern' || savedPillar === 'balanced' || savedPillar === 'industrial') {
            setPillarState(savedPillar);
            document.documentElement.setAttribute('data-pillar', savedPillar);
        } else {
            // Default to industrial
            document.documentElement.setAttribute('data-pillar', 'industrial');
        }
    }, []);

    const setPillar = (newPillar: DesignPillar) => {
        setPillarState(newPillar);
        localStorage.setItem('b0ase-design-pillar', newPillar);
        document.documentElement.setAttribute('data-pillar', newPillar);
    };

    const togglePillar = () => {
        const pillars: DesignPillar[] = ['industrial', 'balanced', 'modern'];
        const currentIndex = pillars.indexOf(pillar);
        const nextPillar = pillars[(currentIndex + 1) % pillars.length];
        setPillar(nextPillar);
    };

    return (
        <DesignPillarContext.Provider value={{ pillar, setPillar, togglePillar }}>
            {children}
        </DesignPillarContext.Provider>
    );
}

export function useDesignPillar() {
    const context = useContext(DesignPillarContext);
    if (context === undefined) {
        throw new Error('useDesignPillar must be used within a DesignPillarProvider');
    }
    return context;
}
