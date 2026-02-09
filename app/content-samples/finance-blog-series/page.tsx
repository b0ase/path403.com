import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function FinanceBlogSeriesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/content-copywriting" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Content & Copywriting</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Finance Blog Series</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Educational blog series on personal finance, designed to build authority and drive organic traffic.
        </p>
      </header>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage service="content-copywriting" projectId="finance-blog" title="Finance Blog Series" />
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            This series covered topics from budgeting basics to investment strategies, making complex financial concepts accessible to a broad audience. The goal was to establish the client as a thought leader and improve SEO performance. Each post was crafted to answer real user questions and encourage sharing.
          </p>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What Was Done</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Developed a content calendar for ongoing blog posts</li>
            <li>Researched trending finance topics and keywords</li>
            <li>Wrote clear, actionable articles for all experience levels</li>
            <li>Optimized each post for SEO and readability</li>
            <li>Promoted content via social media and email</li>
            <li>Included calls to action and interactive elements</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Educational, jargon-free writing style</li>
            <li>SEO-optimized for high-traffic finance keywords</li>
            <li>Series structure to encourage repeat visits</li>
            <li>Actionable tips and real-world examples</li>
            <li>Shareable infographics and checklists</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Sample Excerpt</h2>
          <blockquote className="border-l-4 border-cyan-500 pl-4 text-gray-300 italic mb-4">
            &quot;Building wealth isn&apos;t about luck—it&apos;s about making informed decisions, one step at a time. Our series breaks down the essentials so anyone can take control of their financial future.&quot;
          </blockquote>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Organic traffic increased by 45% in six months</li>
            <li>Client recognized as a trusted finance resource</li>
            <li>High engagement and social shares</li>
            <li>Newsletter signups increased by 20%</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">&quot;</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">&quot;The blog series made personal finance approachable and actionable for our readers. We&apos;ve seen a huge boost in both traffic and trust.&quot;</p>
              <div>
                <p className="font-semibold text-white">Content Marketing Manager</p>
                <p className="text-gray-400 text-sm">Finance Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 