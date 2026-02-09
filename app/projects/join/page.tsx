'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/Providers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaCode, FaPalette, FaRocket, FaUsers, FaClock, FaDollarSign, FaMapMarkerAlt,
  FaGithub, FaExternalLinkAlt, FaEnvelope, FaCheck, FaTimes, FaLock, FaSearch,
  FaFilter, FaStar, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaHeart,
  FaLaptopCode, FaChartLine, FaDatabase, FaMobile, FaShieldAlt, FaBrain
} from 'react-icons/fa';

interface ProjectOpening {
  id: number;
  title: string;
  company: string;
  type: 'full-time' | 'part-time' | 'contract' | 'volunteer' | 'equity';
  category: string;
  description: string;
  requirements: string[];
  skills: string[];
  compensation: string;
  location: string;
  remote: boolean;
  duration: string;
  startDate: string;
  applicationDeadline: string;
  contactEmail: string;
  projectUrl?: string;
  githubUrl?: string;
  featured: boolean;
  urgent: boolean;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  teamSize: number;
  benefits: string[];
}

const availableProjects: ProjectOpening[] = [
  {
    id: 1,
    title: 'Frontend Developer for Next.js SaaS Platform',
    company: 'B0ASE Digital Agency',
    type: 'contract',
    category: 'Web Development',
    description: 'Join our team building a revolutionary SaaS platform using Next.js, TypeScript, and modern web technologies. You\'ll work on user interfaces, implement responsive designs, and integrate with our backend APIs.',
    requirements: [
      '3+ years React/Next.js experience',
      'Strong TypeScript skills',
      'Experience with Tailwind CSS',
      'REST API integration experience',
      'Git workflow proficiency'
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'API Integration'],
    compensation: '£400-600/day',
    location: 'London, UK',
    remote: true,
    duration: '3-6 months',
    startDate: '2024-02-01',
    applicationDeadline: '2024-01-15',
    contactEmail: 'join@b0ase.com',
    projectUrl: 'https://www.b0ase.com/projects/saas-platform',
    githubUrl: '#',
    featured: true,
    urgent: false,
    experienceLevel: 'mid',
    teamSize: 5,
    benefits: ['Remote work', 'Flexible hours', 'Learning budget', 'Portfolio building']
  },
  {
    id: 2,
    title: 'Blockchain Developer for DeFi Protocol',
    company: 'RafsKitchen Studio',
    type: 'equity',
    category: 'Blockchain',
    description: 'Exciting opportunity to build the next generation of DeFi protocols. Work with Solidity, Web3, and cutting-edge blockchain technology to create innovative financial solutions.',
    requirements: [
      'Solidity smart contract development',
      'Web3.js or Ethers.js experience',
      'Understanding of DeFi protocols',
      'Security-first mindset',
      'Experience with testing frameworks'
    ],
    skills: ['Solidity', 'Web3', 'DeFi', 'Smart Contracts', 'Ethereum'],
    compensation: '0.5-2% equity + token allocation',
    location: 'Remote',
    remote: true,
    duration: 'Long-term',
    startDate: '2024-01-20',
    applicationDeadline: '2024-01-10',
    contactEmail: 'blockchain@rafskitchen.website',
    projectUrl: 'https://rafskitchen.website',
    githubUrl: '#',
    featured: true,
    urgent: true,
    experienceLevel: 'senior',
    teamSize: 3,
    benefits: ['Equity participation', 'Token rewards', 'Industry networking', 'Conference attendance']
  },
  {
    id: 3,
    title: 'AI/ML Engineer for Bitcoin Education Platform',
    company: 'Senseii',
    type: 'full-time',
    category: 'AI/Machine Learning',
    description: 'Build AI-powered education systems that teach Bitcoin and blockchain concepts. Work with large language models, natural language processing, and personalized learning algorithms.',
    requirements: [
      'Python ML/AI frameworks (TensorFlow, PyTorch)',
      'NLP and LLM experience',
      'Machine learning model deployment',
      'API development skills',
      'Knowledge of educational technology'
    ],
    skills: ['Python', 'TensorFlow', 'NLP', 'LLMs', 'Machine Learning'],
    compensation: '£60,000-80,000',
    location: 'Hybrid - London',
    remote: false,
    duration: 'Permanent',
    startDate: '2024-02-15',
    applicationDeadline: '2024-01-25',
    contactEmail: 'ai@senseii.com',
    projectUrl: 'https://senseii-zeta.vercel.app/',
    githubUrl: '#',
    featured: false,
    urgent: false,
    experienceLevel: 'mid',
    teamSize: 8,
    benefits: ['Health insurance', 'Pension', 'Learning budget', 'Equity options']
  },
  {
    id: 4,
    title: 'UX/UI Designer for E-commerce Platform',
    company: 'V01D Store',
    type: 'part-time',
    category: 'Design',
    description: 'Design beautiful, conversion-optimized user experiences for our minimalist streetwear e-commerce platform. Focus on clean aesthetics and user journey optimization.',
    requirements: [
      'Strong portfolio in e-commerce design',
      'Figma/Sketch proficiency',
      'Understanding of conversion optimization',
      'Mobile-first design approach',
      'User research experience'
    ],
    skills: ['Figma', 'UI/UX Design', 'E-commerce', 'User Research', 'Prototyping'],
    compensation: '£300-400/day (2-3 days/week)',
    location: 'Remote',
    remote: true,
    duration: '6 months+',
    startDate: '2024-01-15',
    applicationDeadline: '2024-01-05',
    contactEmail: 'design@v01d.store',
    projectUrl: 'https://www.v01d.store/',
    githubUrl: '#',
    featured: false,
    urgent: true,
    experienceLevel: 'mid',
    teamSize: 4,
    benefits: ['Portfolio exposure', 'Creative freedom', 'Brand collaboration', 'Revenue sharing']
  },
  {
    id: 5,
    title: 'Content Creator for Blockchain Research',
    company: 'Future of Blockchain Research',
    type: 'volunteer',
    category: 'Content/Research',
    description: 'Help create educational content about blockchain technology evolution, consensus mechanisms, and economic models. Perfect for building expertise and industry credibility.',
    requirements: [
      'Strong written communication',
      'Interest in blockchain technology',
      'Research and analysis skills',
      'Basic understanding of economics',
      'Social media content creation'
    ],
    skills: ['Content Writing', 'Research', 'Blockchain', 'Social Media', 'Economics'],
    compensation: 'Unpaid + byline credit + portfolio building',
    location: 'Remote',
    remote: true,
    duration: '3-6 months',
    startDate: '2024-01-10',
    applicationDeadline: '2024-01-01',
    contactEmail: 'research@future-of-blockchain.com',
    projectUrl: 'https://future-of-blockchain.vercel.app/',
    githubUrl: '#',
    featured: false,
    urgent: false,
    experienceLevel: 'entry',
    teamSize: 6,
    benefits: ['Industry networking', 'Published portfolio', 'Learning opportunities', 'References']
  },
  {
    id: 6,
    title: 'DevOps Engineer for Decentralized CDN',
    company: 'BitCDN',
    type: 'contract',
    category: 'DevOps/Infrastructure',
    description: 'Build and maintain infrastructure for a revolutionary decentralized content delivery network. Work with cutting-edge distributed systems and blockchain technology.',
    requirements: [
      'Kubernetes and Docker expertise',
      'Cloud infrastructure (AWS/GCP)',
      'CI/CD pipeline experience',
      'Blockchain node operations',
      'Network protocols understanding'
    ],
    skills: ['Kubernetes', 'Docker', 'AWS', 'Blockchain', 'Infrastructure'],
    compensation: '£500-700/day',
    location: 'Remote',
    remote: true,
    duration: '4-8 months',
    startDate: '2024-02-01',
    applicationDeadline: '2024-01-12',
    contactEmail: 'devops@bitcdn.website',
    projectUrl: 'https://bitcdn.website',
    githubUrl: '#',
    featured: false,
    urgent: false,
    experienceLevel: 'senior',
    teamSize: 7,
    benefits: ['Cutting-edge tech', 'High day rate', 'Equity options', 'Conference speaking']
  }
];

const categories = [
  'All Categories',
  'Web Development',
  'Blockchain',
  'AI/Machine Learning',
  'Design',
  'Content/Research',
  'DevOps/Infrastructure',
  'Mobile Development',
  'Data Science'
];

const experienceLevels = ['All Levels', 'entry', 'mid', 'senior', 'lead'];
const projectTypes = ['All Types', 'full-time', 'part-time', 'contract', 'volunteer', 'equity'];

export default function JoinProjectsPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const [filteredProjects, setFilteredProjects] = useState<ProjectOpening[]>(availableProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedExperience, setSelectedExperience] = useState('All Levels');
  const [selectedType, setSelectedType] = useState('All Types');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectOpening | null>(null);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login?redirect=/projects/join&message=Please log in to view available projects');
    }
  }, [session, isLoading, router]);

  useEffect(() => {
    let filtered = availableProjects;

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    if (selectedExperience !== 'All Levels') {
      filtered = filtered.filter(project => project.experienceLevel === selectedExperience);
    }

    if (selectedType !== 'All Types') {
      filtered = filtered.filter(project => project.type === selectedType);
    }

    if (remoteOnly) {
      filtered = filtered.filter(project => project.remote);
    }

    if (featuredOnly) {
      filtered = filtered.filter(project => project.featured);
    }

    setFilteredProjects(filtered);
  }, [searchTerm, selectedCategory, selectedExperience, selectedType, remoteOnly, featuredOnly]);

  const handleApply = (project: ProjectOpening) => {
    setSelectedProject(project);
    setShowApplicationModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-600';
      case 'part-time': return 'bg-blue-600';
      case 'contract': return 'bg-purple-600';
      case 'volunteer': return 'bg-orange-600';
      case 'equity': return 'bg-pink-600';
      default: return 'bg-gray-600';
    }
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry': return 'text-green-400';
      case 'mid': return 'text-blue-400';
      case 'senior': return 'text-purple-400';
      case 'lead': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading available projects...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <FaLock className="text-6xl text-gray-600 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-300 mb-6">
            You need to be logged in to view and apply for available projects. Please sign in to continue.
          </p>
          <Link 
            href="/login?redirect=/projects/join"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 transition duration-200"
          >
            Sign In to View Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-cyan-400">//</span> Join Our Projects
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mb-4">
            Discover exciting opportunities to collaborate on cutting-edge projects. Join our community of talented developers, designers, and innovators.
          </p>
          <div className="text-sm text-gray-400">
            Welcome back, <span className="text-cyan-400">{session.user.email}</span> • {filteredProjects.length} projects available
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="w-full px-4 md:px-8 py-6 bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
            >
              {experienceLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'All Levels' ? level : `${level.charAt(0).toUpperCase() + level.slice(1)} Level`}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
            >
              {projectTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All Types' ? type : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
              Remote Only
            </label>
            
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
              Featured Projects
            </label>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="px-4 md:px-8 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FaSearch className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`bg-gray-900 border-2 rounded-lg p-6 hover:border-cyan-400 transition-all duration-300 ${
                  project.featured ? 'border-cyan-600' : 'border-gray-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {project.featured && <FaStar className="text-yellow-500" />}
                      {project.urgent && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">URGENT</span>}
                      <span className={`text-xs px-2 py-1 rounded text-white ${getTypeColor(project.type)}`}>
                        {project.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-cyan-400 font-medium">{project.company}</p>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-3 mb-4">
                  <p className="text-gray-300 text-sm">{project.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt />
                      <span>{project.remote ? 'Remote' : project.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaUsers />
                      <span>{project.teamSize} team members</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Experience:</span>
                    <span className={`font-medium ${getExperienceColor(project.experienceLevel)}`}>
                      {project.experienceLevel.charAt(0).toUpperCase() + project.experienceLevel.slice(1)} Level
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Compensation:</span>
                    <span className="text-green-400 font-medium">{project.compensation}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-800 text-cyan-400 text-xs px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="text-xs text-gray-400">+{project.skills.length - 4} more</span>
                    )}
                  </div>
                </div>

                {/* Deadlines */}
                <div className="mb-4 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Apply by: {new Date(project.applicationDeadline).toLocaleDateString()}</span>
                    <span>Starts: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.projectUrl && (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View Project"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    )}
                    {project.githubUrl && project.githubUrl !== '#' && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                        title="View Repository"
                      >
                        <FaGithub />
                      </a>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleApply(project)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FaEnvelope />
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Modal */}
      {showApplicationModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Apply for Position</h2>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-semibold text-cyan-400">{selectedProject.title}</h3>
                <p className="text-gray-300">{selectedProject.company}</p>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Requirements:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {selectedProject.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FaCheck className="text-green-400 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Benefits:</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {selectedProject.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FaHeart className="text-pink-400 mt-0.5 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Ready to apply? Send your application directly to the project team.
                </p>
                <a
                  href={`mailto:${selectedProject.contactEmail}?subject=Application for ${selectedProject.title}&body=Hi,%0D%0A%0D%0AI'm interested in applying for the ${selectedProject.title} position at ${selectedProject.company}.%0D%0A%0D%0APlease find my application details below:%0D%0A%0D%0A[Your message here]%0D%0A%0D%0ABest regards`}
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 mr-4"
                >
                  Send Application Email
                </a>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 