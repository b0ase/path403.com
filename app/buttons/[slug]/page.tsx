import TechStylePage from '@/components/buttons/TechStylePage';
import { portfolioData } from '@/lib/data';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    // Generate static paths for all projects with tokens
    return portfolioData.projects
        .filter(p => p.tokenName)
        .map(project => ({
            slug: project.slug,
        }));
}

export default async function ProjectButtonPage({ params }: PageProps) {
    const { slug } = await params;
    
    // Find the project
    const project = portfolioData.projects.find(p => p.slug === slug);
    
    if (!project || !project.tokenName) {
        notFound();
    }

    // For now, all project buttons use the TechStylePage component
    // TODO: Create project-specific button themes
    return <TechStylePage />;
}
