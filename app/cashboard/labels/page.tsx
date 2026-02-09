import { Plus, Tag, Edit, Trash2, Users } from 'lucide-react'

// Mock data for demonstration
const mockLabels = [
  {
    id: '1',
    name: 'Senior',
    color: '#3B82F6',
    description: 'Senior level positions',
    usageCount: 8,
    organization: 'All',
  },
  {
    id: '2',
    name: 'Frontend',
    color: '#10B981',
    description: 'Frontend developers',
    usageCount: 5,
    organization: 'Tech Team',
  },
  {
    id: '3',
    name: 'UI/UX',
    color: '#F59E0B',
    description: 'Design and user experience',
    usageCount: 3,
    organization: 'Design Team',
  },
  {
    id: '4',
    name: 'Lead',
    color: '#8B5CF6',
    description: 'Team leads and managers',
    usageCount: 4,
    organization: 'All',
  },
  {
    id: '5',
    name: 'Strategy',
    color: '#EF4444',
    description: 'Strategic roles',
    usageCount: 2,
    organization: 'Product Team',
  },
]

export default function LabelsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Labels</h1>
            <p className="text-gray-300">Organize and categorize cash handles</p>
          </div>
          <button className="glass-button px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium">
            <Plus className="w-5 h-5" />
            <span>Create Label</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Labels</p>
                <p className="text-2xl font-bold text-white">{mockLabels.length}</p>
              </div>
              <Tag className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-white">
                  {mockLabels.reduce((sum, label) => sum + label.usageCount, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Organizations</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(mockLabels.map(label => label.organization)).size}
                </p>
              </div>
              <Tag className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Labels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockLabels.map((label) => (
            <div key={label.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: label.color }}
                  >
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{label.name}</h3>
                    <p className="text-sm text-gray-400">{label.organization}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="glass-button p-2 rounded-lg">
                    <Edit className="w-4 h-4 text-white" />
                  </button>
                  <button className="glass-button p-2 rounded-lg">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4">{label.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">{label.usageCount} cash handles</span>
                </div>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Label Form */}
        <div className="glass-card p-6 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Create New Label</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Label Name</label>
              <input
                type="text"
                placeholder="e.g., Senior, Frontend..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Color</label>
              <input
                type="color"
                className="w-full h-10 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
                defaultValue="#3B82F6"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Organization</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Organizations</option>
                <option value="tech">Tech Team</option>
                <option value="design">Design Team</option>
                <option value="product">Product Team</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full glass-button px-4 py-2 rounded-lg text-white font-medium">
                Create Label
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              placeholder="Describe what this label represents..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            ></textarea>
          </div>
        </div>

        {/* Empty State */}
        {mockLabels.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No labels yet</h3>
            <p className="text-gray-400 mb-6">Create your first label to organize cash handles</p>
            <button className="glass-button px-6 py-3 rounded-lg text-white font-medium">
              Create Label
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 