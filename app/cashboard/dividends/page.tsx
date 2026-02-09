import { DollarSign, Send, Clock, CheckCircle, XCircle, Search } from 'lucide-react'

// Mock data for demonstration
const mockDividends = [
  {
    id: '1',
    amount: 500,
    recipient: '@alex',
    sender: '@admin',
    description: 'Monthly dividend payment',
    status: 'sent',
    date: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    amount: 750,
    recipient: '@sarah',
    sender: '@admin',
    description: 'Performance bonus',
    status: 'pending',
    date: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    amount: 1200,
    recipient: '@mike',
    sender: '@admin',
    description: 'Project completion bonus',
    status: 'sent',
    date: '2024-01-14T16:45:00Z',
  },
]

const statusConfig = {
  sent: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20' },
}

export default function DividendsPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dividends</h1>
            <p className="text-gray-300">Send and track dividend payments</p>
          </div>
          <button className="glass-button px-6 py-3 rounded-lg flex items-center space-x-2 text-white font-medium">
            <Send className="w-5 h-5" />
            <span>Send Dividend</span>
          </button>
        </div>

        {/* Quick Send Form */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Send Dividend</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recipient</label>
              <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select recipient...</option>
                <option value="@alex">@alex</option>
                <option value="@sarah">@sarah</option>
                <option value="@mike">@mike</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount ($)</label>
              <input
                type="number"
                placeholder="0.00"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <input
                type="text"
                placeholder="Payment reason..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full glass-button px-4 py-2 rounded-lg text-white font-medium">
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sent</p>
                <p className="text-2xl font-bold text-white">
                  ${mockDividends.reduce((sum, div) => sum + div.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-white">
                  ${mockDividends.filter(d => d.status === 'pending').reduce((sum, div) => sum + div.amount, 0).toLocaleString()}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-white">{mockDividends.length}</p>
              </div>
              <Send className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search dividends..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dividends List */}
        <div className="space-y-4">
          {mockDividends.map((dividend) => {
            const status = statusConfig[dividend.status as keyof typeof statusConfig]
            const StatusIcon = status.icon
            
            return (
              <div key={dividend.id} className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${status.bg} rounded-lg flex items-center justify-center`}>
                      <StatusIcon className={`w-6 h-6 ${status.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{dividend.recipient}</h3>
                        <span className="text-sm text-gray-400">from {dividend.sender}</span>
                      </div>
                      <p className="text-gray-300 mb-2">{dividend.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(dividend.date).toLocaleDateString()} • {new Date(dividend.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">${dividend.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-400 capitalize">{dividend.status}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {mockDividends.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No dividends yet</h3>
            <p className="text-gray-400 mb-6">Send your first dividend payment to get started</p>
            <button className="glass-button px-6 py-3 rounded-lg text-white font-medium">
              Send Dividend
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 