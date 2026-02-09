#!/usr/bin/env node
/**
 * Seed script to add music files to Supabase Audio table
 * Run with: node scripts/seed-music.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Music files found on the drive
const musicByProject = {
    aivj: [
        { filename: 'Broken Machine Dreams.wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Broken Machine Dreams.wav' },
        { filename: 'Echoes in the Machine.mp3', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Echoes in the Machine.mp3' },
        { filename: 'Echoes in the Rust.mp3', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Echoes in the Rust.mp3' },
        { filename: 'Kintsugi Breaks.wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Kintsugi Breaks.wav' },
        { filename: 'Kōjō no Yami (Factory Darkness).wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Kōjō no Yami (Factory Darkness).wav' },
        { filename: 'Neon Rust.wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Neon Rust.wav' },
        { filename: 'Shadow Steps.wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Shadow Steps.wav' },
        { filename: 'Shattered Echoes.mp3', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Shattered Echoes.mp3' },
        { filename: 'Shattered Frequencies.wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Shattered Frequencies.wav' },
        { filename: 'Shattered Kintsugi.mp3', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/Shattered Kintsugi.mp3' },
        { filename: '都市の静脈 (Veins of the City).wav', path: '/Volumes/2026/Projects/AI-VJ/AIVJ music/都市の静脈 (Veins of the City).wav' },
    ],
    cherry: [
        { filename: 'Cherry Graffiti.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Cherry Graffiti.mp3' },
        { filename: 'Digital Ghosts.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Digital Ghosts.mp3' },
        { filename: 'Echo Chamber.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Echo Chamber.mp3' },
        { filename: 'Fragments of Static.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Fragments of Static.mp3' },
        { filename: 'Glitch in the Fog.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Glitch in the Fog.mp3' },
        { filename: 'Glitch in the Wind.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Glitch in the Wind.mp3' },
        { filename: 'Midnight Graffiti Symphony.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Midnight Graffiti Symphony.mp3' },
        { filename: 'Midnight Murals.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Midnight Murals.mp3' },
        { filename: 'Shadow Steps.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Shadow Steps.mp3' },
        { filename: 'Shattered Frequencies.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Shattered Frequencies.mp3' },
        { filename: 'Shattered Signal.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Shattered Signal.mp3' },
        { filename: 'Shattered Signals.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Shattered Signals.mp3' },
        { filename: 'Static Dreams.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Static Dreams.mp3' },
        { filename: 'Static Reverie.mp3', path: '/Volumes/2026/iCloud-Backup/cherry-x-music-01/Static Reverie.mp3' },
    ],
    npg: [
        { filename: 'Unicorn Dreamscape.mp3', path: '/Volumes/2026/Projects/ninja-punk-girls-com/public/music/Unicorn Dreamscape.mp3' },
    ],
    vexvoid: [], // No music found yet
    zerodice: [], // No music found yet
};

async function seedMusic() {
    console.log('🎵 Seeding music files to Supabase...\n');

    for (const [projectSlug, tracks] of Object.entries(musicByProject)) {
        if (tracks.length === 0) {
            console.log(`  ⏭️  ${projectSlug}: No tracks to add`);
            continue;
        }

        console.log(`  📁 ${projectSlug}: ${tracks.length} tracks`);

        for (const track of tracks) {
            const audioRecord = {
                id: randomUUID(),
                projectSlug,
                filename: track.filename,
                url: `file://${track.path}`,
                createdAt: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('Audio')
                .upsert(audioRecord, { onConflict: 'id' });

            if (error) {
                console.error(`    ❌ Failed to add ${track.filename}:`, error.message);
            } else {
                console.log(`    ✅ ${track.filename}`);
            }
        }
    }

    console.log('\n✨ Music seeding complete!');
}

seedMusic().catch(console.error);
