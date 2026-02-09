export type Contact = {
  id: string
  name: string
  email?: string
  phone?: string
  handcashHandle?: string
  avatar?: string
  company?: string
  role?: string
  tags?: string[]
  notes?: string
  lastContact?: string
  status: 'active' | 'inactive' | 'pending'
  type: 'individual' | 'business' | 'ai-agent'
  verified?: boolean
}

export const contacts: Contact[] = [
  // Individual Contacts
  {
    id: 'alex-chen',
    name: 'Alex Chen',
    email: 'alex.chen@techcorp.com',
    phone: '+1-555-0123',
    handcashHandle: '$alexchen',
    avatar: '👨‍💻',
    company: 'TechCorp Inc.',
    role: 'Senior Developer',
    tags: ['developer', 'blockchain', 'frontend'],
    notes: 'Lead developer on the payment integration project',
    lastContact: '2024-01-15',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'sarah-johnson',
    name: 'Sarah Johnson',
    email: 'sarah@designstudio.co',
    phone: '+1-555-0124',
    handcashHandle: '$sarahj',
    avatar: '👩‍🎨',
    company: 'Creative Design Studio',
    role: 'UI/UX Designer',
    tags: ['design', 'ui-ux', 'creative'],
    notes: 'Excellent design work on our mobile app',
    lastContact: '2024-01-12',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'mike-rodriguez',
    name: 'Mike Rodriguez',
    email: 'mike.r@financeplus.com',
    phone: '+1-555-0125',
    handcashHandle: '$mikefinance',
    avatar: '👨‍💼',
    company: 'Finance Plus',
    role: 'Financial Advisor',
    tags: ['finance', 'advisor', 'investments'],
    notes: 'Handles our corporate investment strategy',
    lastContact: '2024-01-10',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'emma-watson',
    name: 'Emma Watson',
    email: 'emma.watson@marketingpro.com',
    phone: '+1-555-0126',
    handcashHandle: '$emmaw',
    avatar: '👩‍💼',
    company: 'Marketing Pro',
    role: 'Marketing Director',
    tags: ['marketing', 'strategy', 'campaigns'],
    notes: 'Running our Q1 marketing campaign',
    lastContact: '2024-01-08',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'james-kim',
    name: 'James Kim',
    email: 'j.kim@legalfirm.com',
    phone: '+1-555-0127',
    handcashHandle: '$jameslaw',
    avatar: '👨‍⚖️',
    company: 'Kim & Associates',
    role: 'Legal Counsel',
    tags: ['legal', 'contracts', 'compliance'],
    notes: 'Corporate legal advisor and contract specialist',
    lastContact: '2024-01-05',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'lisa-park',
    name: 'Lisa Park',
    email: 'lisa@hrexperts.com',
    phone: '+1-555-0128',
    handcashHandle: '$lisahr',
    avatar: '👩‍💻',
    company: 'HR Experts',
    role: 'HR Manager',
    tags: ['hr', 'recruitment', 'people'],
    notes: 'Helping with our hiring process',
    lastContact: '2024-01-03',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'tom-brown',
    name: 'Tom Brown',
    email: 'tom.brown@operations.co',
    phone: '+1-555-0129',
    handcashHandle: '$tombrown',
    avatar: '👨‍🔧',
    company: 'Operations Co.',
    role: 'Operations Manager',
    tags: ['operations', 'logistics', 'efficiency'],
    notes: 'Optimizing our supply chain processes',
    lastContact: '2024-01-01',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'anna-garcia',
    name: 'Anna Garcia',
    email: 'anna@datasolutions.com',
    phone: '+1-555-0130',
    handcashHandle: '$annadata',
    avatar: '👩‍🔬',
    company: 'Data Solutions',
    role: 'Data Scientist',
    tags: ['data', 'analytics', 'ai'],
    notes: 'Building our predictive analytics models',
    lastContact: '2023-12-28',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'david-lee',
    name: 'David Lee',
    email: 'david@cloudtech.io',
    phone: '+1-555-0131',
    handcashHandle: '$davidcloud',
    avatar: '👨‍💻',
    company: 'CloudTech',
    role: 'DevOps Engineer',
    tags: ['devops', 'cloud', 'infrastructure'],
    notes: 'Managing our cloud infrastructure',
    lastContact: '2023-12-25',
    status: 'active',
    type: 'individual',
    verified: true
  },
  {
    id: 'maria-gonzalez',
    name: 'Maria Gonzalez',
    email: 'maria@salesforce.com',
    phone: '+1-555-0132',
    handcashHandle: '$mariasales',
    avatar: '👩‍💼',
    company: 'SalesForce Pro',
    role: 'Sales Director',
    tags: ['sales', 'business-development', 'relationships'],
    notes: 'Leading our enterprise sales efforts',
    lastContact: '2023-12-20',
    status: 'active',
    type: 'individual',
    verified: true
  },

  // Business Contacts
  {
    id: 'techcorp-inc',
    name: 'TechCorp Inc.',
    email: 'contact@techcorp.com',
    phone: '+1-555-1000',
    handcashHandle: '$techcorp',
    avatar: '🏢',
    role: 'Technology Partner',
    tags: ['partner', 'technology', 'enterprise'],
    notes: 'Primary technology integration partner',
    lastContact: '2024-01-15',
    status: 'active',
    type: 'business',
    verified: true
  },
  {
    id: 'finance-plus',
    name: 'Finance Plus',
    email: 'info@financeplus.com',
    phone: '+1-555-2000',
    handcashHandle: '$financeplus',
    avatar: '🏦',
    role: 'Financial Services',
    tags: ['finance', 'banking', 'services'],
    notes: 'Corporate banking and financial services',
    lastContact: '2024-01-10',
    status: 'active',
    type: 'business',
    verified: true
  },
  {
    id: 'legal-associates',
    name: 'Legal Associates',
    email: 'contact@legalassoc.com',
    phone: '+1-555-3000',
    handcashHandle: '$legalassoc',
    avatar: '⚖️',
    role: 'Legal Services',
    tags: ['legal', 'law-firm', 'contracts'],
    notes: 'Corporate legal services and compliance',
    lastContact: '2024-01-05',
    status: 'active',
    type: 'business',
    verified: true
  },

  // Pending/Inactive Contacts
  {
    id: 'john-pending',
    name: 'John Smith',
    email: 'john@example.com',
    handcashHandle: '$johnsmith',
    avatar: '👤',
    company: 'Startup Inc.',
    role: 'Founder',
    tags: ['startup', 'founder', 'potential-partner'],
    notes: 'Potential partnership discussion',
    lastContact: '2023-12-01',
    status: 'pending',
    type: 'individual',
    verified: false
  },
  {
    id: 'old-contact',
    name: 'Robert Johnson',
    email: 'robert@oldcompany.com',
    phone: '+1-555-9999',
    avatar: '👨‍💼',
    company: 'Old Company',
    role: 'Former Partner',
    tags: ['former', 'partner'],
    notes: 'Previous business relationship',
    lastContact: '2023-06-15',
    status: 'inactive',
    type: 'individual',
    verified: false
  }
]

export const getContacts = () => contacts
export const getActiveContacts = () => contacts.filter(c => c.status === 'active')
export const getContactsByType = (type: Contact['type']) => contacts.filter(c => c.type === type)
export const getContactsByTag = (tag: string) => contacts.filter(c => c.tags?.includes(tag))
export const searchContacts = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return contacts.filter(c => 
    c.name.toLowerCase().includes(lowercaseQuery) ||
    c.email?.toLowerCase().includes(lowercaseQuery) ||
    c.company?.toLowerCase().includes(lowercaseQuery) ||
    c.role?.toLowerCase().includes(lowercaseQuery) ||
    c.handcashHandle?.toLowerCase().includes(lowercaseQuery) ||
    c.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}
