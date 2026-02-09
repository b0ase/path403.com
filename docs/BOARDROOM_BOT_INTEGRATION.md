# Boardroom Bot Integration Guide

## Overview
This integration allows your Board_Room_Bot to interact with the b0ase.com/boardroom page through a shared API. Both your bot and the website can read and write boardroom member data.

## API Endpoints

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://b0ase.com`

### 1. Get All Members
```http
GET /api/boardroom/members
```

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": "uuid",
      "username": "Board_Room_Bot",
      "role": "System Admin",
      "wallet_address": null,
      "source": "bot",
      "joined_at": "2025-01-19T19:35:30.392Z"
    }
  ],
  "count": 1
}
```

### 2. Add New Member
```http
POST /api/boardroom/members
Content-Type: application/json

{
  "username": "NewUser",
  "role": "Investor",
  "wallet_address": "0x1234567890abcdef",
  "source": "bot"
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "id": "uuid",
    "username": "NewUser",
    "role": "Investor",
    "wallet_address": "0x1234567890abcdef",
    "source": "bot",
    "joined_at": "2025-01-19T19:35:30.392Z"
  },
  "message": "Member added successfully"
}
```

## Bot Integration Examples

### Python (Discord.py)
```python
import aiohttp
import json

class BoardroomBot:
    def __init__(self, api_url="https://b0ase.com"):
        self.api_url = api_url
    
    async def get_members(self):
        """Get all boardroom members"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.api_url}/api/boardroom/members") as response:
                data = await response.json()
                return data.get('members', [])
    
    async def add_member(self, username, role, wallet_address=None):
        """Add a new boardroom member"""
        payload = {
            "username": username,
            "role": role,
            "wallet_address": wallet_address,
            "source": "bot"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.api_url}/api/boardroom/members",
                json=payload
            ) as response:
                data = await response.json()
                return data

# Usage example
@bot.command()
async def add_boardroom_member(ctx, username, role, wallet_address=None):
    bot_integration = BoardroomBot()
    result = await bot_integration.add_member(username, role, wallet_address)
    
    if result.get('success'):
        await ctx.send(f"✅ Added {username} as {role} to the boardroom!")
    else:
        await ctx.send(f"❌ Failed to add member: {result.get('error')}")

@bot.command()
async def list_boardroom_members(ctx):
    bot_integration = BoardroomBot()
    members = await bot_integration.get_members()
    
    if members:
        member_list = "\n".join([f"• {m['username']} ({m['role']}) - {m['source']}" for m in members])
        await ctx.send(f"**Boardroom Members:**\n{member_list}")
    else:
        await ctx.send("No members found in the boardroom.")
```

### JavaScript (Discord.js)
```javascript
class BoardroomBot {
    constructor(apiUrl = 'https://b0ase.com') {
        this.apiUrl = apiUrl;
    }

    async getMembers() {
        const response = await fetch(`${this.apiUrl}/api/boardroom/members`);
        const data = await response.json();
        return data.members || [];
    }

    async addMember(username, role, walletAddress = null) {
        const response = await fetch(`${this.apiUrl}/api/boardroom/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                role,
                wallet_address: walletAddress,
                source: 'bot'
            })
        });
        return await response.json();
    }
}

// Usage example
const boardroomBot = new BoardroomBot();

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!addmember')) {
        const [, username, role, walletAddress] = message.content.split(' ');
        
        if (!username || !role) {
            return message.reply('Usage: !addmember <username> <role> [wallet_address]');
        }

        const result = await boardroomBot.addMember(username, role, walletAddress);
        
        if (result.success) {
            message.reply(`✅ Added ${username} as ${role} to the boardroom!`);
        } else {
            message.reply(`❌ Failed to add member: ${result.error}`);
        }
    }

    if (message.content === '!members') {
        const members = await boardroomBot.getMembers();
        
        if (members.length > 0) {
            const memberList = members.map(m => `• ${m.username} (${m.role}) - ${m.source}`).join('\n');
            message.reply(`**Boardroom Members:**\n${memberList}`);
        } else {
            message.reply('No members found in the boardroom.');
        }
    }
});
```

## Testing

Run the test script to verify the API is working:

```bash
node scripts/test-boardroom-api.js
```

## Database Schema

The `boardroom_members` table structure:

```sql
CREATE TABLE boardroom_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(255),
  source VARCHAR(50) DEFAULT 'website', -- 'bot' or 'website'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Next Steps

1. **Test the API** with the provided test script
2. **Integrate with your bot** using the examples above
3. **Add more features** like:
   - Member removal
   - Role updates
   - Activity tracking
   - Real-time notifications

## Support

If you need help with the integration, check:
- API responses in browser dev tools
- Server logs for errors
- Database connection status 