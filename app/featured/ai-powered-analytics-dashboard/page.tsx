import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function AiPoweredAnalyticsDashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/software-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Software Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI-Powered Analytics Dashboard</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Business intelligence dashboard using machine learning to predict trends and provide actionable insights.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            {/* TODO: Add detailed project overview text here */}
            This dashboard leverages AI and machine learning to provide deep insights into business data, identify trends, and offer predictive analytics to drive decision-making. It was designed for clarity and ease of use for non-technical users.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage 
            service="software-development" 
            projectId="ai-analytics" 
            title="AI-Powered Analytics Dashboard"
          />
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {/* TODO: Add specific tasks accomplished */}
            <li>Developed machine learning models for trend prediction and anomaly detection.</li>
            <li>Integrated various data sources into a unified analytics platform.</li>
            <li>Designed an intuitive and interactive dashboard interface with D3.js.</li>
            <li>Built a scalable backend API to serve data to the dashboard.</li>
            <li>Containerized the application using Docker for easy deployment.</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['TensorFlow', 'Python', 'D3.js', 'Docker', 'Flask', 'Pandas', 'Scikit-learn'].map((tech, index) => (
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
            {/* TODO: Add key features of the dashboard */}
            <li>Predictive analytics and forecasting.</li>
            <li>Interactive data visualizations and charts.</li>
            <li>Customizable reporting and dashboards.</li>
            <li>Anomaly detection and alerts.</li>
            <li>Integration with multiple data sources.</li>
            <li>User-friendly interface for non-technical users.</li>
          </ul>
        </div>
      </section>

      {/* Optional sections (Results & Impact, Client Testimonial) can be added here if needed */}

    </div>
  );
} 