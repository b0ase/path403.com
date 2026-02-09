# PC Database Server Setup

## On Your PC

1. **Clone this repo**:
   ```bash
   git clone <your-repo-url>
   cd b0ase.com
   ```

2. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

3. **Start Supabase**:
   ```bash
   supabase start
   ```

4. **Note the connection details** (you'll see output like):
   ```
   API URL: http://127.0.0.1:54321
   anon key: eyJhbGci...
   ```

## On Your Mac

Update `.env.local` to point to your PC:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://YOUR_PC_IP:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## Multi-Project Setup

For each new project:
1. Clone project repo on PC
2. Run `supabase start` in project folder  
3. Update Mac's .env.local with PC IP and new port

Supabase auto-assigns different ports (54321, 54322, etc.) for each project.

## Management Commands

```bash
# Start this project's database
supabase start

# Stop this project's database  
supabase stop

# Check status
supabase status

# View all running containers
docker ps
```

## Benefits
- $0/month for unlimited projects
- Full control over data
- No vendor lock-in
- Easy Git-based deployment