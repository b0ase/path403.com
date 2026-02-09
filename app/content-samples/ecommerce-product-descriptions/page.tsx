import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function EcommerceProductDescriptionsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/content-copywriting" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Content & Copywriting</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">E-commerce Product Descriptions</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Persuasive, SEO-optimized product copy for luxury retail brands, crafted to drive conversions and reflect brand voice.
        </p>
      </header>
      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage service="content-copywriting" projectId="product-descriptions" title="E-commerce Product Descriptions" />
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            This project involved rewriting hundreds of product descriptions for a luxury e-commerce retailer. The goal was to increase conversion rates, improve SEO, and create a consistent, engaging brand voice across the catalog. Each description was tailored to highlight unique product benefits and appeal to the target audience&apos;s aspirations.
          </p>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What Was Done</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Developed a brand style guide for product copy</li>
            <li>Researched target audience and competitor positioning</li>
            <li>Wrote unique, benefit-driven descriptions for each product</li>
            <li>Integrated strategic keywords for SEO</li>
            <li>Collaborated with designers to match copy with visuals</li>
            <li>Tested and refined copy based on A/B results</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Consistent brand voice across all product pages</li>
            <li>SEO-optimized for high-intent keywords</li>
            <li>Benefit-focused, persuasive language</li>
            <li>Mobile-friendly formatting</li>
            <li>Scannable bullet points and clear calls to action</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Sample Excerpt</h2>
          <blockquote className="border-l-4 border-cyan-500 pl-4 text-gray-300 italic mb-4">
            &quot;Experience the ultimate in comfort and style with our Italian leather Chelsea boots. Handcrafted for durability and designed for the modern trendsetter, these boots elevate any outfit—day or night.&quot;
          </blockquote>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Conversion rate increased by 32% in three months</li>
            <li>Improved organic search rankings for key products</li>
            <li>Positive customer feedback on product clarity</li>
            <li>Brand perception improved in post-launch surveys</li>
          </ul>
        </div>
      </section>
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">&quot;</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">&quot;These descriptions capture the essence of our brand and make every product irresistible. Our sales team and customers love them!&quot;</p>
              <div>
                <p className="font-semibold text-white">E-commerce Marketing Lead</p>
                <p className="text-gray-400 text-sm">Luxury Retail Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 