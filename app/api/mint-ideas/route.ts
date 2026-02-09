import { NextResponse } from 'next/server';

const ideaPool = [
  {
    id: '1',
    name: 'PetMatch AI',
    description: 'AI-powered platform that matches pets in shelters with ideal adopters using personality and lifestyle data.',
    modelType: 'original',
    color: 'bg-pink-500',
    icon: 'FaPaw',
  },
  {
    id: '2',
    name: 'GreenCart',
    description: 'Eco-friendly grocery delivery service that sources only local, sustainable products.',
    modelType: 'clone',
    color: 'bg-green-500',
    icon: 'FaLeaf',
  },
  {
    id: '3',
    name: 'SkillSwap',
    description: 'Peer-to-peer platform for trading skills and services without money.',
    modelType: 'original',
    color: 'bg-blue-500',
    icon: 'FaExchangeAlt',
  },
  {
    id: '4',
    name: 'RemoteChef',
    description: 'Virtual cooking classes with celebrity chefs, live-streamed and interactive.',
    modelType: 'clone',
    color: 'bg-yellow-500',
    icon: 'FaUtensils',
  },
  {
    id: '5',
    name: 'ArtifyMe',
    description: 'AI turns your selfies into custom digital art in dozens of styles, ready for print or NFT.',
    modelType: 'original',
    color: 'bg-purple-500',
    icon: 'FaPaintBrush',
  },
  {
    id: '6',
    name: 'FitCoin',
    description: 'Earn crypto rewards for completing fitness challenges and healthy habits.',
    modelType: 'original',
    color: 'bg-orange-500',
    icon: 'FaRunning',
  },
];

export async function GET() {
  // Shuffle and pick 5 random ideas
  const shuffled = ideaPool.sort(() => 0.5 - Math.random());
  const ideas = shuffled.slice(0, 5);
  return NextResponse.json({ ideas });
} 