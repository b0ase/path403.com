#!/usr/bin/env node
/**
 * Upload Studio Media to Supabase Storage
 * 
 * This script:
 * 1. Reads Video/Audio records with file:// URLs from Supabase
 * 2. Uploads the actual files to Supabase Storage
 * 3. Updates the database records with public URLs
 * 
 * Run with: node scripts/upload-studio-media.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Try service role key first, fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON');

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'studio-assets';

// Ensure bucket exists (skip if error - likely already exists)
async function ensureBucket() {
    try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.find(b => b.name === BUCKET_NAME);

        if (!exists) {
            console.log(`📦 Creating bucket: ${BUCKET_NAME}`);
            const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
                public: true,
                fileSizeLimit: 500 * 1024 * 1024, // 500MB limit
            });
            if (error && !error.message.includes('already exists')) {
                console.error('⚠️ Bucket creation issue:', error.message);
                console.log('Continuing anyway - bucket may already exist...');
            }
        } else {
            console.log(`📦 Bucket exists: ${BUCKET_NAME}`);
        }
    } catch (err) {
        console.log('⚠️ Could not check buckets, continuing anyway...');
    }
}

// Upload a single file and return the public URL
async function uploadFile(localPath, remotePath, contentType) {
    // Check if file exists locally
    if (!fs.existsSync(localPath)) {
        console.log(`  ⚠️ File not found: ${localPath}`);
        return null;
    }

    const fileContent = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);

    console.log(`  ⬆️ Uploading: ${fileName} (${(fileContent.length / 1024 / 1024).toFixed(1)}MB)`);

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(remotePath, fileContent, {
            contentType,
            upsert: true,
        });

    if (error) {
        console.log(`  ❌ Upload failed: ${error.message}`);
        return null;
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(remotePath);

    return urlData.publicUrl;
}

// Get content type from file extension
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.ogg': 'audio/ogg',
        '.flac': 'audio/flac',
    };
    return types[ext] || 'application/octet-stream';
}

// Process Video table
async function processVideos() {
    console.log('\n🎬 Processing Videos...');

    const { data: videos, error } = await supabase
        .from('Video')
        .select('*')
        .like('url', 'file://%');

    if (error) {
        console.error('Failed to fetch videos:', error.message);
        return;
    }

    console.log(`Found ${videos?.length || 0} videos with file:// URLs`);

    for (const video of videos || []) {
        const localPath = video.url.replace('file://', '');
        const fileName = path.basename(localPath);
        const remotePath = `videos/${video.projectSlug}/${fileName}`;
        const contentType = getContentType(localPath);

        const publicUrl = await uploadFile(localPath, remotePath, contentType);

        if (publicUrl) {
            // Update database record
            const { error: updateError } = await supabase
                .from('Video')
                .update({ url: publicUrl })
                .eq('id', video.id);

            if (updateError) {
                console.log(`  ❌ DB update failed: ${updateError.message}`);
            } else {
                console.log(`  ✅ Updated: ${fileName}`);
            }
        }
    }
}

// Process Audio table
async function processAudio() {
    console.log('\n🎵 Processing Audio...');

    const { data: tracks, error } = await supabase
        .from('Audio')
        .select('*')
        .like('url', 'file://%');

    if (error) {
        console.error('Failed to fetch audio:', error.message);
        return;
    }

    console.log(`Found ${tracks?.length || 0} audio tracks with file:// URLs`);

    for (const track of tracks || []) {
        const localPath = track.url.replace('file://', '');
        const fileName = path.basename(localPath);
        const remotePath = `audio/${track.projectSlug}/${fileName}`;
        const contentType = getContentType(localPath);

        const publicUrl = await uploadFile(localPath, remotePath, contentType);

        if (publicUrl) {
            // Update database record
            const { error: updateError } = await supabase
                .from('Audio')
                .update({ url: publicUrl })
                .eq('id', track.id);

            if (updateError) {
                console.log(`  ❌ DB update failed: ${updateError.message}`);
            } else {
                console.log(`  ✅ Updated: ${fileName}`);
            }
        }
    }
}

// Main
async function main() {
    console.log('🚀 Starting Studio Media Upload to Supabase Storage\n');

    await ensureBucket();
    await processVideos();
    await processAudio();

    console.log('\n✨ Upload complete!');
}

main().catch(console.error);
