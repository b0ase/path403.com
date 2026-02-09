---
name: vps-hardening
description: VPS security hardening and server configuration. Use when setting up new VPS, hardening existing servers, or auditing server security. Triggers on "harden VPS", "secure server", "VPS security", "server hardening", "SSH security", or "firewall setup".
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# VPS Hardening

Comprehensive VPS security hardening guide. Within 60 seconds of spinning up a new VPS, automated bots are already scanning it. This skill helps you secure servers against the most common attack vectors.

## When to Use

**Use when:**
- Setting up a new VPS
- Hardening an existing server
- Auditing server security posture
- Configuring SSH securely
- Setting up firewalls
- Deploying production infrastructure

**Triggers:**
- "Harden this VPS"
- "Secure my server"
- "VPS security audit"
- "Set up SSH keys"
- "Configure firewall"
- "Server security check"

## Quick Start

### Emergency Hardening (10 minutes)

For immediate security when time is critical:

```bash
# Run the emergency hardening script
bash .claude/skills/vps-hardening/scripts/emergency.sh
```

Or manually:

```bash
# Update everything
sudo apt update && sudo apt upgrade -y

# Create non-root user
adduser deployer && usermod -aG sudo deployer

# Basic firewall
sudo apt install ufw -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable

# Fail2ban with defaults
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Disable root password login
sudo passwd -l root
```

### Full Hardening

For comprehensive security:

```bash
# Run the full hardening script
bash .claude/skills/vps-hardening/scripts/harden.sh
```

### Security Audit

To check current security posture:

```bash
# Run security audit
bash .claude/skills/vps-hardening/scripts/audit.sh
```

---

## The Seven Critical Mistakes

### Mistake #1: Not Updating the System

Every piece of software has vulnerabilities. Patches fix them. If you're not patching, you're running known-vulnerable software that attackers have pre-built exploits for.

**The Fix:**

```bash
# Update all packages
sudo apt update && sudo apt upgrade -y

# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure unattended-upgrades
```

**Configure automatic updates:**

```bash
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Ensure these lines are uncommented:
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
```

**Red flag:** A server that's been up for 400 days without updates isn't impressive—it's concerning.

---

### Mistake #2: Logging in as Root

Root can do anything. One typo, one compromised session, and your entire system is gone.

**The Fix:**

```bash
# Create a non-root user
adduser deployer

# Add to sudo group
usermod -aG sudo deployer

# Test it works (in new terminal)
su - deployer
sudo whoami  # Should output: root
```

**CRITICAL:** Test the new user can sudo BEFORE proceeding. Later we'll disable root login entirely.

---

### Mistake #3: Using Password Authentication for SSH

Passwords can be guessed. SSH keys can't be brute-forced in any practical timeframe.

**The Fix:**

**Step 1: Generate SSH key on your LOCAL machine:**

```bash
# Ed25519 is modern and secure
ssh-keygen -t ed25519 -C "your-email@example.com"

# Or RSA if you need compatibility
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

**Step 2: Copy key to server:**

```bash
ssh-copy-id deployer@your-server-ip
```

**Step 3: Configure SSH daemon on the SERVER:**

```bash
sudo nano /etc/ssh/sshd_config
```

Set these values:
```
# Disable root login
PermitRootLogin no

# Disable password authentication
PasswordAuthentication no
PermitEmptyPasswords no

# Limit login attempts
MaxAuthTries 3

# Only allow specific users
AllowUsers deployer

# Use Protocol 2 only (more secure)
Protocol 2

# Disable X11 forwarding unless needed
X11Forwarding no

# Idle timeout (optional)
ClientAliveInterval 300
ClientAliveCountMax 2
```

**Step 4: Restart SSH:**

```bash
sudo systemctl restart sshd
```

**⚠️ CRITICAL:** Keep your current session open and test in a NEW terminal before closing anything:

```bash
ssh deployer@your-server-ip
```

If you can't log in, you still have the original session to fix things.

---

### Mistake #4: No Firewall

Without a firewall, every port is potentially accessible to the internet.

**The Fix (UFW - Uncomplicated Firewall):**

```bash
# Install UFW
sudo apt install ufw -y

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (CRITICAL - do this before enabling!)
sudo ufw allow ssh
# Or specific port: sudo ufw allow 22/tcp

# Allow web traffic (if running web server)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

**Only open ports for services you're actually running.** Every open port is attack surface.

**Common port rules:**
```bash
# Web server
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# PostgreSQL (only from specific IP)
sudo ufw allow from 10.0.0.5 to any port 5432

# Redis (localhost only - default, no rule needed)

# Custom SSH port
sudo ufw allow 2222/tcp
sudo ufw delete allow ssh
```

---

### Mistake #5: No Brute-Force Protection

Even with SSH keys, bots will hammer your server with login attempts constantly.

**The Fix (Fail2ban):**

```bash
# Install Fail2ban
sudo apt install fail2ban -y

# Create local config (never edit jail.conf directly)
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

**Configure SSH jail:**

```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

This means: 3 failed attempts in 10 minutes = banned for 1 hour.

**Aggressive settings for known bad actors:**

```ini
[sshd-aggressive]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 1
bantime = 86400
findtime = 86400
```

**Restart and enable:**

```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

**Check banned IPs:**
```bash
sudo fail2ban-client status sshd
```

**Unban an IP (if needed):**
```bash
sudo fail2ban-client set sshd unbanip 192.168.1.100
```

---

### Mistake #6: Running Unnecessary Services

Every running service is potential attack surface. If you're not using it, turn it off.

**The Fix:**

**See what's listening:**

```bash
sudo ss -tulpn
```

**Example output:**
```
Netid  State   Local Address:Port   Process
tcp    LISTEN  0.0.0.0:22           sshd
tcp    LISTEN  0.0.0.0:80           nginx
tcp    LISTEN  127.0.0.1:5432       postgres
tcp    LISTEN  0.0.0.0:631          cups
```

**Disable what you don't need:**

```bash
# Printing service (usually not needed on servers)
sudo systemctl disable cups
sudo systemctl stop cups

# Avahi (mDNS - rarely needed)
sudo systemctl disable avahi-daemon
sudo systemctl stop avahi-daemon

# Bluetooth (never needed on VPS)
sudo systemctl disable bluetooth
sudo systemctl stop bluetooth
```

**Ask yourself:** For each listening service, do I actually need this?

**List all enabled services:**
```bash
sudo systemctl list-unit-files --state=enabled
```

---

### Mistake #7: No Backups

Security isn't just prevention—it's recovery. If your server gets compromised, you need to rebuild quickly.

**The Fix:**

**Create backup script:**

```bash
sudo nano /usr/local/bin/backup.sh
```

```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/backup"
DATE=$(date +%Y-%m-%d_%H-%M)
HOSTNAME=$(hostname)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# What to back up
BACKUP_PATHS="/home /etc /var/www /var/lib/postgresql"

# Create backup
echo "Starting backup at $(date)"
tar -czf "$BACKUP_DIR/backup-$HOSTNAME-$DATE.tar.gz" $BACKUP_PATHS 2>/dev/null || true

# Delete backups older than 7 days
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +7 -delete

# Sync to remote (optional - uncomment if you have remote backup)
# rsync -avz --delete "$BACKUP_DIR/" backup@remote-server:/backups/$HOSTNAME/

echo "Backup completed at $(date)"
```

**Make executable and test:**

```bash
sudo chmod +x /usr/local/bin/backup.sh
sudo /usr/local/bin/backup.sh
```

**Schedule with cron:**

```bash
sudo crontab -e
```

Add:
```
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1
```

**IMPORTANT:** Backups on the same server aren't really backups. Always sync to remote storage:
- AWS S3
- Backblaze B2
- Another VPS
- rsync to remote server

---

## Complete Hardening Checklist

For every new VPS:

- [ ] Update all packages
- [ ] Enable automatic security updates
- [ ] Create non-root user with sudo
- [ ] Set up SSH key authentication
- [ ] Disable password authentication
- [ ] Disable root login
- [ ] Configure firewall (UFW)
- [ ] Install and configure Fail2ban
- [ ] Disable unnecessary services
- [ ] Set up off-server backups
- [ ] Configure timezone correctly
- [ ] Set up log rotation
- [ ] Configure NTP for time sync

---

## Advanced Hardening

### Change Default SSH Port

Security through obscurity isn't security, but it reduces log noise:

```bash
sudo nano /etc/ssh/sshd_config
```

```
Port 2222
```

```bash
# Update firewall BEFORE restarting SSH!
sudo ufw allow 2222/tcp
sudo ufw delete allow ssh
sudo systemctl restart sshd
```

### Kernel Hardening (sysctl)

```bash
sudo nano /etc/sysctl.conf
```

Add:
```bash
# Disable IP forwarding (unless running as router)
net.ipv4.ip_forward = 0

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0

# Enable SYN flood protection
net.ipv4.tcp_syncookies = 1

# Ignore ICMP broadcasts
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP errors
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable reverse path filtering
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log martians (packets with impossible addresses)
net.ipv4.conf.all.log_martians = 1
```

Apply:
```bash
sudo sysctl -p
```

### Secure Shared Memory

```bash
sudo nano /etc/fstab
```

Add:
```
tmpfs     /run/shm     tmpfs     defaults,noexec,nosuid     0     0
```

### Install and Configure AppArmor

```bash
sudo apt install apparmor apparmor-utils -y
sudo aa-enforce /etc/apparmor.d/*

# Check status
sudo aa-status
```

### Set Up Intrusion Detection (AIDE)

```bash
sudo apt install aide -y
sudo aideinit

# Run check
sudo aide.wrapper --check
```

### Configure Login Banners

```bash
sudo nano /etc/issue.net
```

```
***************************************************************************
                            WARNING

This system is for authorized users only. All activity is monitored and
recorded. Unauthorized access will be prosecuted to the fullest extent
of the law.
***************************************************************************
```

Enable in SSH:
```bash
sudo nano /etc/ssh/sshd_config
```

```
Banner /etc/issue.net
```

---

## Monitoring

### Check Auth Logs

```bash
# Recent SSH attempts
sudo tail -f /var/log/auth.log

# Failed SSH attempts
sudo grep "Failed password" /var/log/auth.log

# Successful logins
sudo grep "Accepted" /var/log/auth.log
```

### Check Fail2ban Status

```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

### Check Open Ports

```bash
sudo ss -tulpn
sudo netstat -tulpn
```

### Check Running Services

```bash
sudo systemctl list-units --type=service --state=running
```

### Check for Rootkits

```bash
sudo apt install rkhunter -y
sudo rkhunter --update
sudo rkhunter --check
```

---

## Common Attack Patterns

### What Bots Look For

1. **Default passwords** - root:root, admin:admin, etc.
2. **Unpatched vulnerabilities** - CVEs with public exploits
3. **Open Redis/MongoDB** - Databases without auth
4. **WordPress admin** - Brute force /wp-admin
5. **SSH on port 22** - Standard target
6. **Exposed .git directories** - Source code leakage
7. **Debug endpoints** - /debug, /status, /metrics
8. **Default configs** - phpMyAdmin, Adminer, etc.

### What to Watch For

```bash
# Watch auth.log in real-time
sudo tail -f /var/log/auth.log | grep -E "(Failed|Invalid|error)"

# Check for repeated patterns
sudo grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -rn | head -20
```

---

## Recovery

### If Compromised

1. **Don't panic, but act fast**
2. **Isolate the server** - Disable network or firewall all traffic
3. **Preserve evidence** - Don't delete logs
4. **Boot from rescue ISO** if possible
5. **Check for backdoors:**
   ```bash
   # Check for unauthorized SSH keys
   cat /home/*/.ssh/authorized_keys
   cat /root/.ssh/authorized_keys

   # Check for unauthorized cron jobs
   crontab -l
   ls -la /etc/cron.*

   # Check for modified binaries
   debsums -c
   ```
6. **Rebuild from backup** - Don't try to "clean" a compromised server
7. **Rotate all credentials**
8. **Review how it happened**

### Emergency Lockdown

```bash
# Block all incoming except your IP
sudo ufw default deny incoming
sudo ufw reset
sudo ufw allow from YOUR.IP.ADDRESS to any port 22
sudo ufw enable
```

---

## Severity Ratings

When auditing, rate findings:

**CRITICAL** - Immediate exploitation risk
- Root login enabled with password
- No firewall
- Unpatched critical CVEs
- Default credentials

**HIGH** - Significant security impact
- Password authentication enabled
- No Fail2ban
- Unnecessary services running
- No automatic updates

**MEDIUM** - Moderate security concern
- SSH on default port
- No login banners
- Missing kernel hardening
- No intrusion detection

**LOW** - Minor security improvement
- No NTP configured
- Missing AIDE
- Verbose SSH logs not enabled

---

## Output Format

After running audit, present:

```
========================================
VPS SECURITY AUDIT RESULTS
========================================
Server: your-server-hostname
Date: 2026-01-31

CRITICAL ISSUES: 1
HIGH ISSUES: 2
MEDIUM ISSUES: 3
LOW ISSUES: 2

=== CRITICAL ===

1. [CRITICAL] Root Login Enabled
   File: /etc/ssh/sshd_config
   Current: PermitRootLogin yes
   Fix: Set PermitRootLogin no

=== HIGH ===

2. [HIGH] Password Authentication Enabled
   File: /etc/ssh/sshd_config
   Current: PasswordAuthentication yes
   Fix: Set PasswordAuthentication no
   Prereq: Ensure SSH key is set up first!

3. [HIGH] No Firewall Active
   Status: ufw inactive
   Fix: sudo ufw enable
   Prereq: Ensure SSH is allowed first!

=== RECOMMENDATIONS ===

1. Fix CRITICAL issues immediately
2. Fix HIGH issues before exposing to internet
3. Schedule MEDIUM/LOW fixes for maintenance window
4. Re-run audit after fixes
5. Set up monitoring for ongoing security

NEXT STEPS:
1. Run emergency hardening script
2. Test SSH access with key
3. Enable firewall
4. Re-run this audit
```

---

## Integration

### Pre-Deploy Hook

Add to deployment scripts:

```bash
#!/bin/bash
echo "Running VPS security audit..."
bash .claude/skills/vps-hardening/scripts/audit.sh

if [ $? -ne 0 ]; then
    echo "❌ Security issues found. Fix before deploying."
    exit 1
fi
```

### Ansible Playbook (Optional)

For repeatable hardening across multiple servers, consider converting to Ansible:

```yaml
# See scripts/ansible/ for playbooks
ansible-playbook -i inventory.ini hardening.yml
```

---

## Resources

- CIS Benchmarks: https://www.cisecurity.org/cis-benchmarks
- Ubuntu Security Guide: https://ubuntu.com/security
- SSH Hardening: https://www.ssh.com/academy/ssh/hardening
- Fail2ban Docs: https://www.fail2ban.org/wiki/
- UFW Manual: https://help.ubuntu.com/community/UFW

---

## Lessons Learned (Real-World Case Study)

### The Fail2ban Self-Ban Incident (Jan 2026)

During a hardening session on a Hetzner VPS, we locked ourselves out by getting banned by our own Fail2ban. Here's what happened and how to prevent it:

**What Happened:**
1. Started hardening server (UFW, SSH config, new deployer user)
2. Made multiple SSH connection attempts while testing
3. Fail2ban saw the repeated connection attempts as brute-force
4. Our IP got banned
5. SSH connections started failing with "Connection refused"
6. Spent 30 minutes debugging firewalls when the issue was Fail2ban

**The Symptoms:**
- `ssh: connect to host X.X.X.X port 22: Connection refused`
- SSH daemon running and listening (confirmed via `ss -tlpn | grep 22`)
- UFW rules correct (port 22 allowed)
- iptables flushed, nftables checked - all looked fine
- But connection still refused

**The Fix:**
```bash
# Check if you're banned
fail2ban-client status sshd

# Look for your IP in the banned list
# Banned IP list: 1.2.3.4 5.6.7.8 YOUR.IP.HERE ...

# Unban yourself
fail2ban-client set sshd unbanip YOUR.IP.ADDRESS
```

**How to Prevent This:**

⚠️ **ALWAYS whitelist your IP before making SSH changes:**

```bash
# Add your IP to Fail2ban ignore list FIRST
echo "ignoreip = 127.0.0.1/8 ::1 YOUR.IP.ADDRESS" >> /etc/fail2ban/jail.local
systemctl restart fail2ban
```

Or add to `/etc/fail2ban/jail.local`:
```ini
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 YOUR.STATIC.IP

[sshd]
enabled = true
# ... rest of config
```

**Debugging Checklist When SSH Fails:**

If you get "Connection refused" after hardening:

1. **Check Fail2ban first** (most common cause!):
   ```bash
   fail2ban-client status sshd
   ```

2. **Check SSH is running:**
   ```bash
   systemctl status ssh
   ss -tlnp | grep 22
   ```

3. **Check UFW:**
   ```bash
   ufw status | grep 22
   ```

4. **Check iptables:**
   ```bash
   iptables -L INPUT -n
   ```

5. **Check nftables (Ubuntu 24.04+):**
   ```bash
   nft list ruleset | head -50
   ```

6. **Check Hetzner Cloud Firewall:**
   - Web panel → Firewalls section
   - Even if empty, check server's Networking tab

**Recovery via Hetzner Console:**

If completely locked out:
1. Go to Hetzner Cloud Console (console.hetzner.cloud)
2. Select server → Click "Console" (VNC access)
3. Login as root with password
4. Run: `fail2ban-client set sshd unbanip YOUR.IP`
5. Whitelist your IP for future

**Key Takeaway:**

> Before making ANY SSH or firewall changes, whitelist your IP in Fail2ban. It takes 10 seconds and saves potentially hours of debugging.

---

## Disclaimer

This skill provides security guidance but is not a replacement for:
- Professional security audits
- Compliance assessments (PCI-DSS, HIPAA, etc.)
- Penetration testing by certified professionals
- Organization-specific security policies

Use as a baseline, not the complete solution.

**Most attackers are lazy.** They're looking for default passwords, unpatched software, and misconfigured services. Make your server slightly harder than the next one, and they'll move on.
