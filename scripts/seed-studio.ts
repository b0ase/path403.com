import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Video mappings - projectSlug based on content
const videos = [
  // NPG project videos
  { filename: 'NPGX.mp4', url: '/videos/NPGX.mp4', projectSlug: 'npg' },
  { filename: 'npg-red-slug.mp4', url: '/videos/npg-red-slug.mp4', projectSlug: 'npg' },

  // Cherry project videos
  { filename: 'A_train_rushes_past_while_urban_.mp4', url: '/videos/A_train_rushes_past_while_urban_.mp4', projectSlug: 'cherry' },
  { filename: 'zoom_around_the_party_picnic_and.mp4', url: '/videos/zoom_around_the_party_picnic_and.mp4', projectSlug: 'cherry' },
  { filename: 'fade_the_letters_so_see_the_sing.mp4', url: '/videos/fade_the_letters_so_see_the_sing.mp4', projectSlug: 'cherry' },

  // VexVoid project videos
  { filename: 'zero-dice-slug-video-01.mp4', url: '/videos/zero-dice-slug-video-01.mp4', projectSlug: 'vexvoid' },
  { filename: 'zero-dice-02.mp4', url: '/videos/zero-dice-02.mp4', projectSlug: 'vexvoid' },
  { filename: 'zero-dice-03.mp4', url: '/videos/zero-dice-03.mp4', projectSlug: 'vexvoid' },
  { filename: 'zero-dice-04.mp4', url: '/videos/zero-dice-04.mp4', projectSlug: 'vexvoid' },

  // AIVJ project videos
  { filename: 'Professional_Mode_Generated_Video (2).mp4', url: '/videos/Professional_Mode_Generated_Video (2).mp4', projectSlug: 'aivj' },
  { filename: 'Professional_Mode_zoom_and_flip_the_letters____go_ (1).mp4', url: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (1).mp4', projectSlug: 'aivj' },
  { filename: 'Professional_Mode_zoom_and_flip_the_letters____go_ (2).mp4', url: '/videos/Professional_Mode_zoom_and_flip_the_letters____go_ (2).mp4', projectSlug: 'aivj' },
  { filename: 'Standard_Mode_Generated_Video.mp4', url: '/videos/Standard_Mode_Generated_Video.mp4', projectSlug: 'aivj' },
  { filename: 'Extended_Video.mp4', url: '/videos/Extended_Video.mp4', projectSlug: 'aivj' },
];

// Audio mappings
const audioTracks = [
  // Cherry project - graffiti/urban themed
  { filename: 'Cherry Graffiti.mp3', url: '/music/Cherry Graffiti.mp3', projectSlug: 'cherry' },
  { filename: 'Cherry Graffiti (1).mp3', url: '/music/Cherry Graffiti (1).mp3', projectSlug: 'cherry' },
  { filename: 'Cherry Graffiti (2).mp3', url: '/music/Cherry Graffiti (2).mp3', projectSlug: 'cherry' },
  { filename: 'Midnight Graffiti Symphony.mp3', url: '/music/Midnight Graffiti Symphony.mp3', projectSlug: 'cherry' },
  { filename: 'Midnight Murals.mp3', url: '/music/Midnight Murals.mp3', projectSlug: 'cherry' },
  { filename: 'Shadow Steps.mp3', url: '/music/Shadow Steps.mp3', projectSlug: 'cherry' },

  // VexVoid project - glitch/digital themed
  { filename: 'Digital Ghosts.mp3', url: '/music/Digital Ghosts.mp3', projectSlug: 'vexvoid' },
  { filename: 'Digital Ghosts (1).mp3', url: '/music/Digital Ghosts (1).mp3', projectSlug: 'vexvoid' },
  { filename: 'Digital Ghosts (2).mp3', url: '/music/Digital Ghosts (2).mp3', projectSlug: 'vexvoid' },
  { filename: 'Glitch in the Wind.mp3', url: '/music/Glitch in the Wind.mp3', projectSlug: 'vexvoid' },
  { filename: 'Glitch in the Wind (1).mp3', url: '/music/Glitch in the Wind (1).mp3', projectSlug: 'vexvoid' },
  { filename: 'Glitch in the Fog.mp3', url: '/music/Glitch in the Fog.mp3', projectSlug: 'vexvoid' },
  { filename: 'Shattered Frequencies.mp3', url: '/music/Shattered Frequencies.mp3', projectSlug: 'vexvoid' },
  { filename: 'Shattered Frequencies (1).mp3', url: '/music/Shattered Frequencies (1).mp3', projectSlug: 'vexvoid' },
  { filename: 'Shattered Signals.mp3', url: '/music/Shattered Signals.mp3', projectSlug: 'vexvoid' },
  { filename: 'Shattered Signals (1).mp3', url: '/music/Shattered Signals (1).mp3', projectSlug: 'vexvoid' },

  // AIVJ project - tech/static themed
  { filename: 'Static Dreams.mp3', url: '/music/Static Dreams.mp3', projectSlug: 'aivj' },
  { filename: 'Static Reverie.mp3', url: '/music/Static Reverie.mp3', projectSlug: 'aivj' },
  { filename: 'Fragments of Static.mp3', url: '/music/Fragments of Static.mp3', projectSlug: 'aivj' },
  { filename: 'Echo Chamber.mp3', url: '/music/Echo Chamber.mp3', projectSlug: 'aivj' },
  { filename: 'P_XEL _Øptik_ V.2.mp3', url: '/music/P_XEL _Øptik_ V.2.mp3', projectSlug: 'aivj' },

  // NPG project - ambient/atmospheric
  { filename: 'ambient1.mp3', url: '/music/ambient1.mp3', projectSlug: 'npg' },
  { filename: 'ambient2.mp3', url: '/music/ambient2.mp3', projectSlug: 'npg' },
  { filename: 'ambient3.mp3', url: '/music/ambient3.mp3', projectSlug: 'npg' },
  { filename: 'ambient4.mp3', url: '/music/ambient4.mp3', projectSlug: 'npg' },
  { filename: 'ambient5.mp3', url: '/music/ambient5.mp3', projectSlug: 'npg' },
];

async function seed() {
  console.log('🎬 Seeding studio media...\n');

  // Clear existing data
  console.log('Clearing existing Video records...');
  await supabase.from('Video').delete().neq('id', '');

  console.log('Clearing existing Audio records...');
  await supabase.from('Audio').delete().neq('id', '');

  // Insert videos
  console.log('\n📹 Inserting videos...');
  for (const video of videos) {
    const { error } = await supabase.from('Video').insert({
      filename: video.filename,
      url: video.url,
      projectSlug: video.projectSlug,
    });
    if (error) {
      console.error(`  ❌ ${video.filename}: ${error.message}`);
    } else {
      console.log(`  ✅ ${video.filename} -> ${video.projectSlug}`);
    }
  }

  // Insert audio
  console.log('\n🎵 Inserting audio tracks...');
  for (const track of audioTracks) {
    const { error } = await supabase.from('Audio').insert({
      filename: track.filename,
      url: track.url,
      projectSlug: track.projectSlug,
    });
    if (error) {
      console.error(`  ❌ ${track.filename}: ${error.message}`);
    } else {
      console.log(`  ✅ ${track.filename} -> ${track.projectSlug}`);
    }
  }

  console.log('\n✨ Seeding complete!');
  console.log(`   Videos: ${videos.length}`);
  console.log(`   Audio: ${audioTracks.length}`);
}

seed().catch(console.error);
