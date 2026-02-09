#!/bin/bash
#
# VPS Security Audit Script
# Checks current security posture and reports findings
#
set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Counters
CRITICAL=0
HIGH=0
MEDIUM=0
LOW=0

# Arrays to store findings
declare -a CRITICAL_FINDINGS
declare -a HIGH_FINDINGS
declare -a MEDIUM_FINDINGS
declare -a LOW_FINDINGS

# Helper functions
add_critical() {
    CRITICAL_FINDINGS+=("$1")
    ((CRITICAL++))
}

add_high() {
    HIGH_FINDINGS+=("$1")
    ((HIGH++))
}

add_medium() {
    MEDIUM_FINDINGS+=("$1")
    ((MEDIUM++))
}

add_low() {
    LOW_FINDINGS+=("$1")
    ((LOW++))
}

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
}

check_warn() {
    echo -e "  ${YELLOW}!${NC} $1"
}

# Header
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VPS SECURITY AUDIT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Server: $(hostname)"
echo -e "Date: $(date)"
echo -e "Kernel: $(uname -r)"
echo ""

# ============================================
# CHECK 1: System Updates
# ============================================
echo -e "${BLUE}[1/12] Checking System Updates${NC}"

# Check if updates available
if command -v apt &> /dev/null; then
    UPDATES=$(apt list --upgradable 2>/dev/null | grep -c upgradable || echo "0")
    if [[ "$UPDATES" -gt 10 ]]; then
        check_fail "Many updates available ($UPDATES packages)"
        add_high "System has $UPDATES packages pending update\n   Fix: sudo apt update && sudo apt upgrade -y"
    elif [[ "$UPDATES" -gt 0 ]]; then
        check_warn "Some updates available ($UPDATES packages)"
        add_medium "System has $UPDATES packages pending update\n   Fix: sudo apt update && sudo apt upgrade -y"
    else
        check_pass "System is up to date"
    fi
fi

# Check unattended-upgrades
if dpkg -l | grep -q unattended-upgrades; then
    check_pass "Automatic security updates installed"
else
    check_fail "Automatic security updates NOT installed"
    add_high "Automatic security updates not configured\n   Fix: sudo apt install unattended-upgrades && sudo dpkg-reconfigure unattended-upgrades"
fi

# ============================================
# CHECK 2: User Security
# ============================================
echo ""
echo -e "${BLUE}[2/12] Checking User Security${NC}"

# Check for users with empty passwords
EMPTY_PASS=$(sudo awk -F: '($2 == "" ) { print $1 }' /etc/shadow 2>/dev/null)
if [[ -n "$EMPTY_PASS" ]]; then
    check_fail "Users with empty passwords: $EMPTY_PASS"
    add_critical "Users with empty passwords found: $EMPTY_PASS\n   Fix: Set passwords for these users"
else
    check_pass "No users with empty passwords"
fi

# Check for users with UID 0 (besides root)
UID_ZERO=$(awk -F: '($3 == 0) { print $1 }' /etc/passwd | grep -v root)
if [[ -n "$UID_ZERO" ]]; then
    check_fail "Non-root users with UID 0: $UID_ZERO"
    add_critical "Non-root users with UID 0: $UID_ZERO\n   Fix: Change UID or remove these accounts"
else
    check_pass "No non-root users with UID 0"
fi

# Check if root password is locked
if sudo passwd -S root | grep -q " L "; then
    check_pass "Root password is locked"
else
    check_warn "Root password is NOT locked"
    add_medium "Root password login enabled\n   Fix: sudo passwd -l root"
fi

# ============================================
# CHECK 3: SSH Configuration
# ============================================
echo ""
echo -e "${BLUE}[3/12] Checking SSH Configuration${NC}"

SSHD_CONFIG="/etc/ssh/sshd_config"

# Check PermitRootLogin
if grep -E "^PermitRootLogin\s+no" $SSHD_CONFIG /etc/ssh/sshd_config.d/*.conf 2>/dev/null | grep -q "no"; then
    check_pass "Root login disabled"
elif grep -E "^PermitRootLogin\s+(yes|prohibit-password)" $SSHD_CONFIG /etc/ssh/sshd_config.d/*.conf 2>/dev/null | head -1; then
    check_fail "Root login is ENABLED"
    add_critical "SSH root login is enabled\n   Fix: Set PermitRootLogin no in /etc/ssh/sshd_config"
else
    check_warn "PermitRootLogin not explicitly set (defaults may vary)"
    add_high "SSH PermitRootLogin not explicitly disabled\n   Fix: Add 'PermitRootLogin no' to /etc/ssh/sshd_config"
fi

# Check PasswordAuthentication
if grep -E "^PasswordAuthentication\s+no" $SSHD_CONFIG /etc/ssh/sshd_config.d/*.conf 2>/dev/null | grep -q "no"; then
    check_pass "Password authentication disabled"
else
    check_fail "Password authentication may be ENABLED"
    add_high "SSH password authentication enabled\n   Fix: Set PasswordAuthentication no in /etc/ssh/sshd_config\n   Prereq: Ensure SSH key is set up first!"
fi

# Check SSH port
SSH_PORT=$(grep -E "^Port\s+" $SSHD_CONFIG 2>/dev/null | awk '{print $2}' || echo "22")
if [[ "$SSH_PORT" == "22" || -z "$SSH_PORT" ]]; then
    check_warn "SSH on default port 22"
    add_low "SSH running on default port 22\n   Consider: Change to non-standard port to reduce log noise"
else
    check_pass "SSH on non-default port ($SSH_PORT)"
fi

# ============================================
# CHECK 4: Firewall
# ============================================
echo ""
echo -e "${BLUE}[4/12] Checking Firewall${NC}"

if command -v ufw &> /dev/null; then
    if sudo ufw status | grep -q "Status: active"; then
        check_pass "UFW firewall is active"

        # Count open ports
        OPEN_PORTS=$(sudo ufw status | grep -c "ALLOW" || echo "0")
        if [[ "$OPEN_PORTS" -gt 5 ]]; then
            check_warn "Many ports open ($OPEN_PORTS rules)"
            add_medium "Firewall has $OPEN_PORTS ALLOW rules\n   Review: sudo ufw status verbose"
        else
            check_pass "Reasonable number of open ports ($OPEN_PORTS)"
        fi
    else
        check_fail "UFW firewall is NOT active"
        add_critical "Firewall is disabled\n   Fix: sudo ufw allow ssh && sudo ufw enable"
    fi
else
    # Check iptables as fallback
    if sudo iptables -L -n | grep -q "DROP"; then
        check_pass "iptables has DROP rules"
    else
        check_fail "No firewall detected"
        add_critical "No firewall configured\n   Fix: sudo apt install ufw && sudo ufw allow ssh && sudo ufw enable"
    fi
fi

# ============================================
# CHECK 5: Fail2ban
# ============================================
echo ""
echo -e "${BLUE}[5/12] Checking Fail2ban${NC}"

if command -v fail2ban-client &> /dev/null; then
    if sudo fail2ban-client status 2>/dev/null | grep -q "sshd"; then
        check_pass "Fail2ban is running with SSH jail"

        # Check banned IPs
        BANNED=$(sudo fail2ban-client status sshd 2>/dev/null | grep "Currently banned" | awk '{print $NF}')
        if [[ "$BANNED" -gt 0 ]]; then
            check_pass "Currently banning $BANNED IPs"
        fi
    else
        check_warn "Fail2ban running but SSH jail not active"
        add_medium "Fail2ban SSH jail not configured\n   Fix: Enable [sshd] in /etc/fail2ban/jail.local"
    fi
else
    check_fail "Fail2ban is NOT installed"
    add_high "Fail2ban not installed\n   Fix: sudo apt install fail2ban"
fi

# ============================================
# CHECK 6: Running Services
# ============================================
echo ""
echo -e "${BLUE}[6/12] Checking Running Services${NC}"

# Check for unnecessary services
UNNECESSARY_SERVICES=("cups" "avahi-daemon" "bluetooth" "ModemManager")
for service in "${UNNECESSARY_SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        check_warn "Unnecessary service running: $service"
        add_low "Service '$service' is running but likely not needed\n   Fix: sudo systemctl disable --now $service"
    fi
done

# Count total listening ports
LISTENING_PORTS=$(sudo ss -tulpn | grep LISTEN | wc -l)
if [[ "$LISTENING_PORTS" -gt 10 ]]; then
    check_warn "Many services listening ($LISTENING_PORTS ports)"
    add_medium "Server has $LISTENING_PORTS listening ports\n   Review: sudo ss -tulpn"
else
    check_pass "Reasonable number of listening ports ($LISTENING_PORTS)"
fi

# ============================================
# CHECK 7: Kernel Hardening
# ============================================
echo ""
echo -e "${BLUE}[7/12] Checking Kernel Hardening${NC}"

# Check key sysctl values
IP_FORWARD=$(sysctl -n net.ipv4.ip_forward 2>/dev/null || echo "unknown")
if [[ "$IP_FORWARD" == "0" ]]; then
    check_pass "IP forwarding disabled"
else
    check_warn "IP forwarding enabled"
    add_medium "IP forwarding enabled (may not be needed)\n   Fix: echo 'net.ipv4.ip_forward = 0' | sudo tee /etc/sysctl.d/99-hardening.conf && sudo sysctl -p"
fi

SYNCOOKIES=$(sysctl -n net.ipv4.tcp_syncookies 2>/dev/null || echo "unknown")
if [[ "$SYNCOOKIES" == "1" ]]; then
    check_pass "SYN cookies enabled"
else
    check_warn "SYN cookies not enabled"
    add_medium "SYN flood protection not enabled\n   Fix: echo 'net.ipv4.tcp_syncookies = 1' | sudo tee -a /etc/sysctl.d/99-hardening.conf && sudo sysctl -p"
fi

# ============================================
# CHECK 8: File Permissions
# ============================================
echo ""
echo -e "${BLUE}[8/12] Checking File Permissions${NC}"

# Check /etc/shadow permissions
SHADOW_PERMS=$(stat -c %a /etc/shadow 2>/dev/null || echo "unknown")
if [[ "$SHADOW_PERMS" == "640" || "$SHADOW_PERMS" == "600" || "$SHADOW_PERMS" == "000" ]]; then
    check_pass "/etc/shadow has secure permissions ($SHADOW_PERMS)"
else
    check_fail "/etc/shadow has insecure permissions ($SHADOW_PERMS)"
    add_high "/etc/shadow has insecure permissions\n   Fix: sudo chmod 640 /etc/shadow"
fi

# Check for world-writable files in /etc
WORLD_WRITABLE=$(find /etc -type f -perm -0002 2>/dev/null | wc -l)
if [[ "$WORLD_WRITABLE" -gt 0 ]]; then
    check_fail "World-writable files in /etc: $WORLD_WRITABLE"
    add_high "World-writable files found in /etc\n   Review: find /etc -type f -perm -0002"
else
    check_pass "No world-writable files in /etc"
fi

# Check SSH key permissions
if [[ -f ~/.ssh/authorized_keys ]]; then
    KEY_PERMS=$(stat -c %a ~/.ssh/authorized_keys 2>/dev/null || echo "unknown")
    if [[ "$KEY_PERMS" == "600" || "$KEY_PERMS" == "644" ]]; then
        check_pass "SSH authorized_keys has correct permissions"
    else
        check_warn "SSH authorized_keys permissions may be insecure ($KEY_PERMS)"
        add_medium "SSH authorized_keys permissions\n   Fix: chmod 600 ~/.ssh/authorized_keys"
    fi
fi

# ============================================
# CHECK 9: Backups
# ============================================
echo ""
echo -e "${BLUE}[9/12] Checking Backups${NC}"

# Check for backup script
if [[ -f /usr/local/bin/vps-backup.sh ]]; then
    check_pass "Backup script exists"
else
    check_warn "No backup script found"
    add_medium "No automated backup configured\n   Fix: Run harden.sh to set up backup script"
fi

# Check for backup cron job
if sudo crontab -l 2>/dev/null | grep -q "backup"; then
    check_pass "Backup cron job configured"
else
    check_warn "No backup cron job found"
    add_medium "Backups not scheduled\n   Fix: Configure regular backups with cron"
fi

# ============================================
# CHECK 10: Intrusion Detection
# ============================================
echo ""
echo -e "${BLUE}[10/12] Checking Intrusion Detection${NC}"

if command -v aide &> /dev/null; then
    check_pass "AIDE is installed"
else
    check_warn "AIDE not installed"
    add_low "AIDE (file integrity checker) not installed\n   Consider: sudo apt install aide && sudo aideinit"
fi

if command -v rkhunter &> /dev/null; then
    check_pass "rkhunter is installed"
else
    check_warn "rkhunter not installed"
    add_low "rkhunter (rootkit hunter) not installed\n   Consider: sudo apt install rkhunter"
fi

# ============================================
# CHECK 11: Log Monitoring
# ============================================
echo ""
echo -e "${BLUE}[11/12] Checking Log Monitoring${NC}"

# Check auth.log exists and is being written
if [[ -f /var/log/auth.log ]]; then
    LOG_AGE=$(find /var/log/auth.log -mmin -60 2>/dev/null | wc -l)
    if [[ "$LOG_AGE" -gt 0 ]]; then
        check_pass "Auth logs are being written"
    else
        check_warn "Auth logs may be stale"
    fi
else
    check_fail "Auth log not found"
    add_medium "Authentication logs not found\n   Check: /var/log/auth.log"
fi

# Check for failed login attempts
RECENT_FAILURES=$(grep -c "Failed password" /var/log/auth.log 2>/dev/null || echo "0")
if [[ "$RECENT_FAILURES" -gt 100 ]]; then
    check_warn "High number of failed login attempts ($RECENT_FAILURES)"
    add_medium "Many failed login attempts detected\n   Review: grep 'Failed password' /var/log/auth.log | tail -20"
else
    check_pass "Failed login attempts within normal range ($RECENT_FAILURES)"
fi

# ============================================
# CHECK 12: SSL/TLS Certificates (if applicable)
# ============================================
echo ""
echo -e "${BLUE}[12/12] Checking SSL Certificates${NC}"

if command -v certbot &> /dev/null || [[ -d /etc/letsencrypt/live ]]; then
    # Check certificate expiry
    if [[ -d /etc/letsencrypt/live ]]; then
        for domain_dir in /etc/letsencrypt/live/*/; do
            domain=$(basename "$domain_dir")
            if [[ -f "${domain_dir}cert.pem" ]]; then
                EXPIRY=$(openssl x509 -enddate -noout -in "${domain_dir}cert.pem" 2>/dev/null | cut -d= -f2)
                EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || echo "0")
                NOW_EPOCH=$(date +%s)
                DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

                if [[ "$DAYS_LEFT" -lt 7 ]]; then
                    check_fail "Certificate for $domain expires in $DAYS_LEFT days!"
                    add_critical "SSL certificate expiring soon for $domain\n   Fix: sudo certbot renew"
                elif [[ "$DAYS_LEFT" -lt 30 ]]; then
                    check_warn "Certificate for $domain expires in $DAYS_LEFT days"
                    add_medium "SSL certificate expires in $DAYS_LEFT days\n   Fix: sudo certbot renew"
                else
                    check_pass "Certificate for $domain valid ($DAYS_LEFT days)"
                fi
            fi
        done
    fi
else
    check_pass "No SSL certificates to check (or certbot not installed)"
fi

# ============================================
# RESULTS SUMMARY
# ============================================
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}AUDIT RESULTS SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Display counts with colors
echo -e "CRITICAL ISSUES: ${RED}$CRITICAL${NC}"
echo -e "HIGH ISSUES:     ${YELLOW}$HIGH${NC}"
echo -e "MEDIUM ISSUES:   ${BLUE}$MEDIUM${NC}"
echo -e "LOW ISSUES:      ${GREEN}$LOW${NC}"
echo ""

# Display findings
if [[ $CRITICAL -gt 0 ]]; then
    echo -e "${RED}=== CRITICAL ISSUES ===${NC}"
    for finding in "${CRITICAL_FINDINGS[@]}"; do
        echo -e "${RED}$finding${NC}"
        echo ""
    done
fi

if [[ $HIGH -gt 0 ]]; then
    echo -e "${YELLOW}=== HIGH ISSUES ===${NC}"
    for finding in "${HIGH_FINDINGS[@]}"; do
        echo -e "${YELLOW}$finding${NC}"
        echo ""
    done
fi

if [[ $MEDIUM -gt 0 ]]; then
    echo -e "${BLUE}=== MEDIUM ISSUES ===${NC}"
    for finding in "${MEDIUM_FINDINGS[@]}"; do
        echo -e "$finding"
        echo ""
    done
fi

if [[ $LOW -gt 0 ]]; then
    echo -e "${GREEN}=== LOW ISSUES ===${NC}"
    for finding in "${LOW_FINDINGS[@]}"; do
        echo -e "$finding"
        echo ""
    done
fi

# Overall status
echo -e "${BLUE}========================================${NC}"
if [[ $CRITICAL -gt 0 ]]; then
    echo -e "${RED}STATUS: CRITICAL - Immediate action required!${NC}"
    exit 2
elif [[ $HIGH -gt 0 ]]; then
    echo -e "${YELLOW}STATUS: HIGH RISK - Fix high issues before production${NC}"
    exit 1
elif [[ $MEDIUM -gt 0 ]]; then
    echo -e "${BLUE}STATUS: MODERATE - Review medium issues${NC}"
    exit 0
else
    echo -e "${GREEN}STATUS: GOOD - Server is well hardened${NC}"
    exit 0
fi
