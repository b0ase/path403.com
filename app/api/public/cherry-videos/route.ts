import { NextRequest, NextResponse } from 'next/server';

// Hardcoded list of Cherry video IDs from Google Drive
// These videos must be publicly shared in Google Drive
const CHERRY_VIDEO_IDS = [
  // Add your actual video IDs here
  // You can find these in the Google Drive share link
  // Example: https://drive.google.com/file/d/FILE_ID/view
  '0A1379B2-642A-497E-8A45-DE186CC1172D', // This was the ID from your error message
  // Add more IDs as needed
];

// If you have the actual list of video files, add them here
const CHERRY_VIDEOS = CHERRY_VIDEO_IDS.map((id, index) => ({
  id: id,
  name: `Cherry Mix ${index + 1}`,
  // Direct streaming URL for public Google Drive videos
  url: `https://drive.google.com/uc?export=download&id=${id}`,
  // Alternative streaming URL (sometimes works better)
  streamUrl: `https://drive.google.com/file/d/${id}/preview`,
  // Thumbnail
  thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w320`
}));

export async function GET(request: NextRequest) {
  // Return the hardcoded list of public Cherry videos
  return NextResponse.json({
    videos: CHERRY_VIDEOS,
    count: CHERRY_VIDEOS.length,
    message: 'Public cherry videos from Google Drive'
  });
}