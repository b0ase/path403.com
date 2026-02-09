#!/bin/bash
#
# VPS Full Hardening Script
# Comprehensive security hardening for Ubuntu/Debian VPS
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="/var/log/vps-hardening-$(date +%Y%m%d-%H%M%S).log"

log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VPS FULL HARDENING SCRIPT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Log file: $LOG_FILE"
echo ""

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    if ! sudo -v; then
        echo -e "${RED}This script requires sudo privileges.${NC}"
        exit 1
    fi
fi

# Confirmation
echo -e "${YELLOW}This script will make significant security changes to your system.${NC}"
echo -e "${YELLOW}Make sure you have SSH key access configured before proceeding.${NC}"
echo ""
read -p "Continue with full hardening? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# ============================================
# SECTION 1: SYSTEM UPDATES
# ============================================
log "\n${BLUE}[SECTION 1] System Updates${NC}"

log "Updating package lists..."
sudo apt update | tee -a "$LOG_FILE"

log "Upgrading packages..."
sudo apt upgrade -y | tee -a "$LOG_FILE"

log "Installing essential security packages..."
sudo apt install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    logwatch \
    rkhunter \
    aide \
    libpam-pwquality \
    | tee -a "$LOG_FILE"

# Enable automatic security updates
log "Configuring automatic security updates..."
sudo dpkg-reconfigure -plow unattended-upgrades

cat <<EOF | sudo tee /etc/apt/apt.conf.d/20auto-upgrades
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

log "${GREEN}✓ System updates configured${NC}"

# ============================================
# SECTION 2: USER SECURITY
# ============================================
log "\n${BLUE}[SECTION 2] User Security${NC}"

# Verify non-root user exists
if [[ $EUID -eq 0 ]]; then
    log "${YELLOW}Running as root. Creating non-root admin user recommended.${NC}"
    read -p "Create admin user? (y/N): " CREATE_USER
    if [[ "$CREATE_USER" =~ ^[Yy]$ ]]; then
        read -p "Username: " ADMIN_USER
        if ! id "$ADMIN_USER" &>/dev/null; then
            sudo adduser "$ADMIN_USER"
            sudo usermod -aG sudo "$ADMIN_USER"
            log "${GREEN}✓ Created user $ADMIN_USER with sudo access${NC}"
        else
            log "${GREEN}User $ADMIN_USER already exists${NC}"
        fi
    fi
fi

# Password policy
log "Configuring password policy..."
sudo sed -i 's/# minlen = 8/minlen = 12/' /etc/security/pwquality.conf 2>/dev/null || true
sudo sed -i 's/# dcredit = 0/dcredit = -1/' /etc/security/pwquality.conf 2>/dev/null || true
sudo sed -i 's/# ucredit = 0/ucredit = -1/' /etc/security/pwquality.conf 2>/dev/null || true
sudo sed -i 's/# lcredit = 0/lcredit = -1/' /etc/security/pwquality.conf 2>/dev/null || true
sudo sed -i 's/# ocredit = 0/ocredit = -1/' /etc/security/pwquality.conf 2>/dev/null || true

log "${GREEN}✓ Password policy configured (min 12 chars, complexity required)${NC}"

# ============================================
# SECTION 3: SSH HARDENING
# ============================================
log "\n${BLUE}[SECTION 3] SSH Hardening${NC}"

# Backup SSH config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d)

# Configure SSH
log "Hardening SSH configuration..."

# Create hardened SSH config
sudo tee /etc/ssh/sshd_config.d/hardening.conf > /dev/null <<EOF
# VPS Hardening SSH Configuration
# Generated: $(date)

# Disable root login
PermitRootLogin no

# Disable password authentication (SSH keys only)
PasswordAuthentication no
PermitEmptyPasswords no

# Limit authentication attempts
MaxAuthTries 3
MaxSessions 3

# Disable X11 forwarding
X11Forwarding no

# Disable agent forwarding unless needed
AllowAgentForwarding no

# Disable TCP forwarding unless needed
AllowTcpForwarding no

# Use Protocol 2 only
Protocol 2

# Idle timeout (5 minutes)
ClientAliveInterval 300
ClientAliveCountMax 2

# Restrict to specific users (uncomment and modify)
# AllowUsers deployer admin

# Use strong ciphers only
Ciphers aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,hmac-sha2-512,hmac-sha2-256
KexAlgorithms curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512

# Logging
LogLevel VERBOSE
EOF

log "${YELLOW}Testing SSH configuration...${NC}"
if sudo sshd -t; then
    log "${GREEN}✓ SSH configuration valid${NC}"

    # Ask before restarting SSH
    log "${YELLOW}IMPORTANT: Verify you have SSH key access before restarting SSH!${NC}"
    read -p "Restart SSH to apply changes? (y/N): " RESTART_SSH
    if [[ "$RESTART_SSH" =~ ^[Yy]$ ]]; then
        sudo systemctl restart sshd
        log "${GREEN}✓ SSH restarted with hardened config${NC}"
    else
        log "${YELLOW}SSH not restarted. Run 'sudo systemctl restart sshd' when ready.${NC}"
    fi
else
    log "${RED}✗ SSH configuration error! Reverting...${NC}"
    sudo rm /etc/ssh/sshd_config.d/hardening.conf
fi

# ============================================
# SECTION 4: FIREWALL
# ============================================
log "\n${BLUE}[SECTION 4] Firewall Configuration${NC}"

# Reset UFW to defaults
log "Configuring UFW firewall..."
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh
log "  - SSH (22) allowed"

# Ask about common services
read -p "Allow HTTP (80)? (y/N): " ALLOW_HTTP
if [[ "$ALLOW_HTTP" =~ ^[Yy]$ ]]; then
    sudo ufw allow 80/tcp
    log "  - HTTP (80) allowed"
fi

read -p "Allow HTTPS (443)? (y/N): " ALLOW_HTTPS
if [[ "$ALLOW_HTTPS" =~ ^[Yy]$ ]]; then
    sudo ufw allow 443/tcp
    log "  - HTTPS (443) allowed"
fi

# Enable firewall
echo "y" | sudo ufw enable
sudo ufw status verbose | tee -a "$LOG_FILE"

log "${GREEN}✓ Firewall configured and enabled${NC}"

# ============================================
# SECTION 5: FAIL2BAN
# ============================================
log "\n${BLUE}[SECTION 5] Fail2ban Configuration${NC}"

# Create local jail config
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
# Ban duration (1 hour)
bantime = 3600

# Time window for counting failures
findtime = 600

# Number of failures before ban
maxretry = 3

# Email notifications (configure if needed)
# destemail = admin@example.com
# sendername = Fail2ban
# mta = sendmail

# Action: ban only (no email)
action = %(action_)s

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 10
bantime = 86400
findtime = 600
EOF

# Restart fail2ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

log "${GREEN}✓ Fail2ban configured${NC}"
sudo fail2ban-client status | tee -a "$LOG_FILE"

# ============================================
# SECTION 6: KERNEL HARDENING
# ============================================
log "\n${BLUE}[SECTION 6] Kernel Hardening${NC}"

# Backup sysctl
sudo cp /etc/sysctl.conf /etc/sysctl.conf.backup.$(date +%Y%m%d)

# Create hardening sysctl config
sudo tee /etc/sysctl.d/99-hardening.conf > /dev/null <<EOF
# VPS Hardening Kernel Parameters
# Generated: $(date)

# Disable IP forwarding
net.ipv4.ip_forward = 0
net.ipv6.conf.all.forwarding = 0

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0
net.ipv6.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

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
net.ipv4.conf.default.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0
net.ipv6.conf.default.accept_source_route = 0

# Log martians
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Disable IPv6 if not needed (uncomment if desired)
# net.ipv6.conf.all.disable_ipv6 = 1
# net.ipv6.conf.default.disable_ipv6 = 1

# Harden TCP
net.ipv4.tcp_rfc1337 = 1
net.ipv4.tcp_timestamps = 0

# Increase system limits
fs.file-max = 65535
EOF

# Apply sysctl
sudo sysctl -p /etc/sysctl.d/99-hardening.conf

log "${GREEN}✓ Kernel parameters hardened${NC}"

# ============================================
# SECTION 7: DISABLE UNNECESSARY SERVICES
# ============================================
log "\n${BLUE}[SECTION 7] Disabling Unnecessary Services${NC}"

# Common unnecessary services
SERVICES_TO_DISABLE=(
    "cups"
    "cups-browsed"
    "avahi-daemon"
    "bluetooth"
    "ModemManager"
)

for service in "${SERVICES_TO_DISABLE[@]}"; do
    if systemctl list-unit-files | grep -q "^$service"; then
        sudo systemctl stop "$service" 2>/dev/null || true
        sudo systemctl disable "$service" 2>/dev/null || true
        log "  - Disabled $service"
    fi
done

log "${GREEN}✓ Unnecessary services disabled${NC}"

# ============================================
# SECTION 8: INTRUSION DETECTION
# ============================================
log "\n${BLUE}[SECTION 8] Intrusion Detection${NC}"

# Initialize AIDE
log "Initializing AIDE database (this may take a while)..."
sudo aideinit 2>/dev/null || true

# Update rkhunter
log "Updating rkhunter..."
sudo rkhunter --update 2>/dev/null || true
sudo rkhunter --propupd 2>/dev/null || true

log "${GREEN}✓ Intrusion detection configured${NC}"

# ============================================
# SECTION 9: BACKUP SCRIPT
# ============================================
log "\n${BLUE}[SECTION 9] Backup Configuration${NC}"

# Create backup script
sudo tee /usr/local/bin/vps-backup.sh > /dev/null <<'BACKUP_SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/vps"
DATE=$(date +%Y-%m-%d_%H-%M)
HOSTNAME=$(hostname)
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Paths to backup
BACKUP_PATHS="/etc /home /var/www /var/lib/postgresql /root/.ssh"

# Create backup
echo "Starting backup at $(date)"
tar -czf "$BACKUP_DIR/backup-$HOSTNAME-$DATE.tar.gz" $BACKUP_PATHS 2>/dev/null || true

# Delete old backups
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed at $(date)"
echo "Backup saved to: $BACKUP_DIR/backup-$HOSTNAME-$DATE.tar.gz"
BACKUP_SCRIPT

sudo chmod +x /usr/local/bin/vps-backup.sh

# Add to cron
(sudo crontab -l 2>/dev/null | grep -v "vps-backup.sh"; echo "0 2 * * * /usr/local/bin/vps-backup.sh >> /var/log/vps-backup.log 2>&1") | sudo crontab -

log "${GREEN}✓ Backup script configured (runs daily at 2 AM)${NC}"

# ============================================
# SECTION 10: LOGIN BANNER
# ============================================
log "\n${BLUE}[SECTION 10] Login Banner${NC}"

sudo tee /etc/issue.net > /dev/null <<'BANNER'
***************************************************************************
                            AUTHORIZED ACCESS ONLY

This system is for authorized users only. All activity is monitored and
recorded. Unauthorized access is prohibited and will be prosecuted.

By accessing this system, you consent to monitoring and recording.
***************************************************************************
BANNER

# Enable banner in SSH
if ! grep -q "^Banner /etc/issue.net" /etc/ssh/sshd_config; then
    echo "Banner /etc/issue.net" | sudo tee -a /etc/ssh/sshd_config
fi

log "${GREEN}✓ Login banner configured${NC}"

# ============================================
# SUMMARY
# ============================================
echo ""
log "${BLUE}========================================${NC}"
log "${GREEN}FULL HARDENING COMPLETE${NC}"
log "${BLUE}========================================${NC}"
echo ""
log "Actions taken:"
log "  ${GREEN}✓${NC} System packages updated"
log "  ${GREEN}✓${NC} Automatic security updates enabled"
log "  ${GREEN}✓${NC} Password policy enforced"
log "  ${GREEN}✓${NC} SSH hardened"
log "  ${GREEN}✓${NC} Firewall configured"
log "  ${GREEN}✓${NC} Fail2ban installed"
log "  ${GREEN}✓${NC} Kernel parameters hardened"
log "  ${GREEN}✓${NC} Unnecessary services disabled"
log "  ${GREEN}✓${NC} Intrusion detection configured"
log "  ${GREEN}✓${NC} Backup script installed"
log "  ${GREEN}✓${NC} Login banner set"
echo ""
log "Log file: $LOG_FILE"
echo ""
log "${YELLOW}NEXT STEPS:${NC}"
log "  1. Verify SSH key login in a NEW terminal"
log "  2. Run security audit: bash .claude/skills/vps-hardening/scripts/audit.sh"
log "  3. Configure off-site backup destination"
log "  4. Set up monitoring (optional)"
echo ""
log "${RED}DO NOT close this session until you verify SSH access works!${NC}"
