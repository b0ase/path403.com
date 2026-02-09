# User Role System Documentation

## Overview

The User Role System allows users to define their primary role and strengths, which customizes their experience throughout the platform. This creates personalized pathways that show relevant content, tools, and opportunities based on their selected role.

## Available Roles

### 1. Investor 💹
**Track**: Investment Track
**Description**: Users with capital who want to fund promising projects and entrepreneurs
**Key Traits**:
- Capital Access
- Risk Assessment
- Portfolio Management
- Due Diligence

**Benefits**:
- Access to investment opportunities
- Portfolio tracking tools
- Deal flow notifications
- ROI analytics

### 2. Builder / Developer 💻
**Track**: Development Track
**Description**: Users who create, code, and build digital products and solutions
**Key Traits**:
- Technical Skills
- Problem Solving
- Product Development
- Innovation

**Benefits**:
- Project collaboration tools
- Technical resources
- Developer community
- Code repositories

### 3. Social Media Manager 📱
**Track**: Social Track
**Description**: Users who excel at social media, content creation, and community building
**Key Traits**:
- Content Creation
- Community Management
- Brand Awareness
- Engagement

**Benefits**:
- Content planning tools
- Analytics dashboard
- Scheduling features
- Audience insights

### 4. Business Strategist 👔
**Track**: Strategy Track
**Description**: Users focused on business strategy, planning, and growth optimization
**Key Traits**:
- Strategic Planning
- Market Analysis
- Business Development
- Leadership

**Benefits**:
- Strategy templates
- Market research tools
- Planning frameworks
- Growth metrics

### 5. Creative / Designer 🎨
**Track**: Creative Track
**Description**: Users who design, create visual content, and focus on user experience
**Key Traits**:
- Visual Design
- User Experience
- Creative Thinking
- Brand Identity

**Benefits**:
- Design tools access
- Creative resources
- Portfolio showcase
- Design community

### 6. Marketer 📢
**Track**: Marketing Track
**Description**: Users who drive growth through marketing campaigns and customer acquisition
**Key Traits**:
- Campaign Management
- Customer Acquisition
- Data Analysis
- Growth Hacking

**Benefits**:
- Campaign tools
- Analytics platform
- A/B testing
- Customer insights

### 7. Connector / Networker 🤝
**Track**: Networking Track
**Description**: Users who excel at connecting people and building valuable relationships
**Key Traits**:
- Relationship Building
- Networking
- Partnership Development
- Communication

**Benefits**:
- Connection tools
- Event access
- Networking opportunities
- Relationship CRM

### 8. Community Builder 👥
**Track**: Community Track
**Description**: Users who build and nurture communities around shared interests and goals
**Key Traits**:
- Community Management
- Engagement
- Event Planning
- Culture Building

**Benefits**:
- Community tools
- Event planning
- Member management
- Engagement analytics

## Implementation

### Files Structure

```
/app/studio/role/page.tsx          # Role selection interface
/lib/hooks/useUserRole.ts          # Custom hook for role management
/components/RoleBadge.tsx          # Reusable role display component
/app/studio/page.tsx               # Role-aware studio dashboard
/migrations/add_role_to_profiles.sql # Database migration
```

### Current Storage

Currently using localStorage for role persistence:
- `userRole`: String ID of selected role
- `userRoleData`: JSON object with full role data

### Future Database Integration

Run the migration script to add role support to the database:

```sql
-- Creates user_role_type enum and adds role column to profiles table
-- See /migrations/add_role_to_profiles.sql for details
```

### Components Usage

#### Using the useUserRole Hook

```tsx
import useUserRole from '@/lib/hooks/useUserRole';

function MyComponent() {
  const { userRole, roleData, hasRole, loading, updateRole, clearRole } = useUserRole();
  
  if (loading) return <div>Loading...</div>;
  if (!hasRole()) return <div>Please select a role</div>;
  
  return <div>Welcome, {roleData.title}!</div>;
}
```

#### Using the RoleBadge Component

```tsx
import RoleBadge from '@/components/RoleBadge';

function ProfileHeader() {
  return (
    <div>
      <h1>User Profile</h1>
      <RoleBadge size="lg" showIcon={true} showTitle={true} />
    </div>
  );
}
```

## User Flow

1. **First Visit**: User is directed to `/studio/role` to select their role
2. **Role Selection**: User browses 8 different role options with descriptions
3. **Confirmation**: User sees detailed breakdown of their selected role
4. **Submission**: Role is saved to localStorage (and eventually database)
5. **Redirect**: User is redirected to personalized studio dashboard
6. **Experience**: Throughout the platform, content is customized based on their role

## Customization Points

The role system enables customization in several areas:

- **Dashboard Content**: Show role-specific tools and resources
- **Navigation**: Highlight relevant sections based on role
- **Opportunities**: Filter projects, teams, and opportunities by role fit
- **Content**: Display role-relevant tips, guides, and best practices
- **Community**: Connect users with others in similar or complementary roles

## Future Enhancements

1. **Multi-Role Support**: Allow users to select primary and secondary roles
2. **Role Evolution**: Track how user roles change over time
3. **Role-Based Recommendations**: AI-powered suggestions based on role
4. **Role Compatibility**: Match users for collaboration based on complementary roles
5. **Achievement System**: Role-specific badges and achievements
6. **Analytics**: Track role distribution and engagement patterns

## API Endpoints (Future)

When database integration is complete:

```
GET /api/user/role          # Get current user's role
PUT /api/user/role          # Update user's role
GET /api/roles              # Get all available roles
GET /api/users/by-role/:id  # Get users by role
``` 