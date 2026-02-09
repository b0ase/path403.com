#!/bin/bash
#
# VPS Emergency Hardening Script
# Run this immediately on a new VPS for basic security
# Full hardening should follow with harden.sh
#
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VPS EMERGENCY HARDENING${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}This script provides basic security for a new VPS.${NC}"
echo -e "${YELLOW}Run harden.sh for full hardening afterward.${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo -e "${YELLOW}Running as root. Will create non-root user.${NC}"
else
    echo -e "${GREEN}Running as non-root user. Good!${NC}"
fi

# Step 1: Update system
echo ""
echo -e "${BLUE}[1/6] Updating system packages...${NC}"
if command -v apt &> /dev/null; then
    sudo apt update && sudo apt upgrade -y
elif command -v yum &> /dev/null; then
    sudo yum update -y
elif command -v dnf &> /dev/null; then
    sudo dnf update -y
else
    echo -e "${RED}Unknown package manager. Skipping updates.${NC}"
fi

# Step 2: Create non-root user if running as root
echo ""
echo -e "${BLUE}[2/6] Checking for non-root user...${NC}"
if [[ $EUID -eq 0 ]]; then
    read -p "Enter username for new admin user (default: deployer): " NEW_USER
    NEW_USER=${NEW_USER:-deployer}

    if id "$NEW_USER" &>/dev/null; then
        echo -e "${GREEN}User $NEW_USER already exists.${NC}"
    else
        adduser "$NEW_USER"
        usermod -aG sudo "$NEW_USER"
        echo -e "${GREEN}Created user $NEW_USER with sudo access.${NC}"
    fi

    echo -e "${YELLOW}IMPORTANT: Set up SSH key for $NEW_USER before disabling root!${NC}"
    echo -e "${YELLOW}Run: ssh-copy-id $NEW_USER@$(hostname -I | awk '{print $1}')${NC}"
else
    echo -e "${GREEN}Already running as non-root user.${NC}"
fi

# Step 3: Install and configure firewall
echo ""
echo -e "${BLUE}[3/6] Configuring firewall (UFW)...${NC}"
if command -v apt &> /dev/null; then
    sudo apt install ufw -y
fi

# Check if UFW is active
if sudo ufw status | grep -q "Status: active"; then
    echo -e "${GREEN}Firewall already active.${NC}"
else
    # Set defaults
    sudo ufw default deny incoming
    sudo ufw default allow outgoing

    # Allow SSH (critical!)
    sudo ufw allow ssh

    # Enable firewall
    echo "y" | sudo ufw enable
    echo -e "${GREEN}Firewall enabled. SSH allowed.${NC}"
fi

sudo ufw status

# Step 4: Install Fail2ban
echo ""
echo -e "${BLUE}[4/7] Installing Fail2ban...${NC}"
if command -v apt &> /dev/null; then
    sudo apt install fail2ban -y
elif command -v yum &> /dev/null; then
    sudo yum install epel-release -y
    sudo yum install fail2ban -y
fi

# Enable and start
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
echo -e "${GREEN}Fail2ban installed and running.${NC}"

# Step 5: Whitelist your IP in Fail2ban (CRITICAL!)
echo ""
echo -e "${BLUE}[5/7] Whitelisting your IP in Fail2ban...${NC}"
echo -e "${YELLOW}This prevents you from being locked out during SSH testing!${NC}"

# Get the user's current IP
CURRENT_IP=$(who am i 2>/dev/null | awk '{print $5}' | tr -d '()' | head -1)
if [[ -z "$CURRENT_IP" ]]; then
    # Fallback: try to get from SSH_CONNECTION
    CURRENT_IP=$(echo $SSH_CONNECTION | awk '{print $1}')
fi

if [[ -n "$CURRENT_IP" && "$CURRENT_IP" != "localhost" ]]; then
    echo -e "Detected your IP: ${GREEN}$CURRENT_IP${NC}"

    # Create or update jail.local with ignoreip
    if [[ -f /etc/fail2ban/jail.local ]]; then
        # Check if ignoreip already exists
        if grep -q "^ignoreip" /etc/fail2ban/jail.local; then
            # Append to existing ignoreip if IP not already there
            if ! grep -q "$CURRENT_IP" /etc/fail2ban/jail.local; then
                sudo sed -i "s/^ignoreip = \(.*\)/ignoreip = \1 $CURRENT_IP/" /etc/fail2ban/jail.local
            fi
        else
            # Add ignoreip line
            echo "ignoreip = 127.0.0.1/8 ::1 $CURRENT_IP" | sudo tee -a /etc/fail2ban/jail.local > /dev/null
        fi
    else
        # Create jail.local with ignoreip
        echo -e "[DEFAULT]\nignoreip = 127.0.0.1/8 ::1 $CURRENT_IP" | sudo tee /etc/fail2ban/jail.local > /dev/null
    fi

    sudo systemctl restart fail2ban
    echo -e "${GREEN}Your IP ($CURRENT_IP) is now whitelisted in Fail2ban.${NC}"
else
    echo -e "${YELLOW}Could not detect your IP. Please manually add it to /etc/fail2ban/jail.local:${NC}"
    echo -e "${YELLOW}  ignoreip = 127.0.0.1/8 ::1 YOUR.IP.ADDRESS${NC}"
fi

# Step 6: Disable root password login
echo ""
echo -e "${BLUE}[6/7] Securing root account...${NC}"
if [[ $EUID -ne 0 ]]; then
    # Only lock root if we're not root
    sudo passwd -l root
    echo -e "${GREEN}Root password login disabled.${NC}"
else
    echo -e "${YELLOW}Skipping root lockout (currently running as root).${NC}"
    echo -e "${YELLOW}Run 'sudo passwd -l root' after setting up SSH key for non-root user.${NC}"
fi

# Step 7: Enable automatic security updates
echo ""
echo -e "${BLUE}[7/7] Enabling automatic security updates...${NC}"
if command -v apt &> /dev/null; then
    sudo apt install unattended-upgrades -y
    echo 'APT::Periodic::Update-Package-Lists "1";' | sudo tee /etc/apt/apt.conf.d/20auto-upgrades
    echo 'APT::Periodic::Unattended-Upgrade "1";' | sudo tee -a /etc/apt/apt.conf.d/20auto-upgrades
    echo -e "${GREEN}Automatic security updates enabled.${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}EMERGENCY HARDENING COMPLETE${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Actions taken:"
echo -e "  ${GREEN}✓${NC} System packages updated"
echo -e "  ${GREEN}✓${NC} Firewall enabled (SSH allowed)"
echo -e "  ${GREEN}✓${NC} Fail2ban installed and running"
echo -e "  ${GREEN}✓${NC} Your IP whitelisted in Fail2ban"
echo -e "  ${GREEN}✓${NC} Automatic security updates enabled"
echo ""
echo -e "${YELLOW}NEXT STEPS (manual):${NC}"
echo -e "  1. Set up SSH key authentication"
echo -e "  2. Disable password authentication in /etc/ssh/sshd_config"
echo -e "  3. Disable root login in /etc/ssh/sshd_config"
echo -e "  4. Run full hardening: bash .claude/skills/vps-hardening/scripts/harden.sh"
echo -e "  5. Run security audit: bash .claude/skills/vps-hardening/scripts/audit.sh"
echo ""
echo -e "${RED}WARNING: Do not close this session until you verify SSH key login works!${NC}"
