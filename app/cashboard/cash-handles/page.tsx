import { Plus, Search, Filter, MoreVertical } from 'lucide-react'

// Mock data for demonstration
const mockCashHandles = [
  {
    id: '1',
    handle: '@alex',
    name: 'Alex Johnson',
    role: 'Developer',
    organization: 'Tech Team',
    labels: ['Frontend', 'Senior'],
    balance: 2500,
  },
  {
    id: '2',
    handle: '@sarah',
    name: 'Sarah Chen',
    role: 'Designer',
    organization: 'Design Team',
    labels: ['UI/UX', 'Lead'],
    balance: 1800,
  },
  {
    id: '3',
    handle: '@mike',
    name: 'Mike Rodriguez',
    role: 'Product Manager',
    organization: 'Product Team',
    labels: ['Strategy', 'Senior'],
    balance: 3200,
  },
]

export default function CashHandlesPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cash Handles</h1>
          <p className="text-gray-300">Manage people, roles, and cash handles</p>
        </div>
        <button className="glass-button px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium">
          <Plus className="w-5 h-5" />
          <span>Add Cash Handle</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search cash handles..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 text-white">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Cash Handles List */}
      <div className="space-y-4">
        {mockCashHandles.map((handle) => (
          <div key={handle.id} className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {handle.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{handle.handle}</h3>
                    <span className="text-sm text-gray-400">({handle.name})</span>
                  </div>
                  <p className="text-gray-300 mb-2">{handle.role} • {handle.organization}</p>
                  <div className="flex items-center space-x-2">
                    {handle.labels.map((label, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 text-xs text-white rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="text-xl font-bold text-green-400">${handle.balance.toLocaleString()}</p>
                </div>
                <button className="glass-button p-2 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {mockCashHandles.length === 0 && (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No cash handles yet</h3>
          <p className="text-gray-400 mb-6">Add your first cash handle to get started</p>
          <button className="glass-button px-6 py-3 rounded-lg text-white font-medium">
            Add Cash Handle
          </button>
        </div>
      )}
    </div>
  )
} 