import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function EcommercePlatformPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/web-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Web Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">E-commerce Platform</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          E-commerce platform with integrated payment processing and inventory management.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            Our client, Urban Outfitters Online, needed a robust, scalable e-commerce solution to support their growing online retail business. The goal was to create a seamless shopping experience for customers, streamline inventory management, and enable secure, reliable payment processing.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage 
            service="web-development"
            projectId="ecommerce-platform"
            title="E-commerce Platform"
          />
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Designed a modern, responsive UI for desktop and mobile shoppers</li>
            <li>Developed a custom product catalog and inventory management system</li>
            <li>Integrated Stripe for secure payment processing</li>
            <li>Built a user-friendly admin dashboard for order and customer management</li>
            <li>Implemented real-time order tracking and notifications</li>
            <li>Optimized site performance for fast load times and high conversion rates</li>
            <li>Deployed scalable backend infrastructure using Node.js and MongoDB</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['React', 'Node.js', 'MongoDB', 'Stripe'].map((tech, index) => (
              <span key={index} className="px-4 py-2 bg-gray-800 text-cyan-400 text-sm rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Customizable product catalog with advanced filtering and search</li>
            <li>Inventory management with low-stock alerts</li>
            <li>Integrated payment gateway supporting multiple currencies</li>
            <li>Order history and real-time order status updates for customers</li>
            <li>Admin dashboard for managing products, orders, and customers</li>
            <li>Mobile-first design for seamless shopping on any device</li>
            <li>SEO-optimized product pages and fast page loads</li>
          </ul>
        </div>
      </section>

      {/* Results & Impact */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Sales increased by 40% within the first month after launch</li>
            <li>Customer satisfaction scores improved significantly</li>
            <li>Inventory errors reduced by 90% due to real-time tracking</li>
            <li>Checkout abandonment rate dropped by 25%</li>
            <li>Site performance scores (Lighthouse) improved to 95+</li>
          </ul>
        </div>
      </section>

      {/* Client Testimonial */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">&quot;</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">&quot;The e-commerce platform B0ASE built for us has been a game-changer. Sales are up, customer feedback is positive, and managing inventory is now effortless.&quot;</p>
              <div>
                <p className="font-semibold text-white">Michael Roberts</p>
                <p className="text-gray-400 text-sm">Founder, Urban Outfitters Online</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 