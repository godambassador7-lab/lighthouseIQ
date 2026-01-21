#!/bin/bash
# =============================================================================
# Nursing Layoff Radar - Production Deployment Script
# =============================================================================
# This script sets up the API on a fresh Ubuntu/Debian server with:
# - Node.js 20.x
# - PostgreSQL 15
# - Cloudflare Tunnel
# - Systemd services
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# =============================================================================
# Configuration - EDIT THESE VALUES
# =============================================================================
APP_DIR="/opt/nursing-layoff-radar"
APP_USER="nursing-api"
DB_NAME="nlr"
DB_USER="nlr"
DB_PASSWORD="$(openssl rand -base64 24)"  # Generate random password
API_PORT="8787"
DOMAIN="api.yourdomain.com"  # Your domain

# =============================================================================
# Pre-flight checks
# =============================================================================
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root (use sudo)"
fi

log "Starting Nursing Layoff Radar deployment..."

# =============================================================================
# Step 1: System Updates & Dependencies
# =============================================================================
log "Updating system packages..."
apt-get update && apt-get upgrade -y

log "Installing required packages..."
apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw

# =============================================================================
# Step 2: Install Node.js 20.x
# =============================================================================
log "Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
node --version
npm --version

# =============================================================================
# Step 3: Install PostgreSQL 15
# =============================================================================
log "Installing PostgreSQL 15..."
if ! command -v psql &> /dev/null; then
    sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    apt-get update
    apt-get install -y postgresql-15 postgresql-contrib-15
fi

# Start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# =============================================================================
# Step 4: Create Database & User
# =============================================================================
log "Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
        CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
EOF

# Create warn_notices table
sudo -u postgres psql -d ${DB_NAME} <<EOF
CREATE TABLE IF NOT EXISTS warn_notices (
    id TEXT PRIMARY KEY,
    state VARCHAR(2) NOT NULL,
    employer_name TEXT NOT NULL,
    parent_system TEXT,
    city TEXT,
    county TEXT,
    address TEXT,
    notice_date DATE,
    effective_date DATE,
    employees_affected INTEGER,
    naics TEXT,
    reason TEXT,
    raw_text TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT,
    source_id TEXT,
    attachments JSONB,
    nursing_score INTEGER DEFAULT 0,
    nursing_label TEXT DEFAULT 'Unclear',
    nursing_signals JSONB DEFAULT '[]'::jsonb,
    nursing_keywords JSONB DEFAULT '[]'::jsonb,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_warn_notices_state ON warn_notices(state);
CREATE INDEX IF NOT EXISTS idx_warn_notices_notice_date ON warn_notices(notice_date);
CREATE INDEX IF NOT EXISTS idx_warn_notices_nursing_score ON warn_notices(nursing_score);

-- Grant table permissions
GRANT ALL ON warn_notices TO ${DB_USER};
EOF

log "Database setup complete!"

# =============================================================================
# Step 5: Create Application User
# =============================================================================
log "Creating application user..."
if ! id -u ${APP_USER} &>/dev/null; then
    useradd --system --shell /bin/false --home ${APP_DIR} ${APP_USER}
fi

# =============================================================================
# Step 6: Deploy Application
# =============================================================================
log "Deploying application..."
mkdir -p ${APP_DIR}

# Copy application files (assumes you've uploaded them)
# In practice, you'd clone from git or copy from local
if [ -d "./apps" ]; then
    cp -r . ${APP_DIR}/
else
    warn "Application files not found in current directory."
    warn "Please copy your application to ${APP_DIR}"
fi

# =============================================================================
# Step 7: Create Environment File
# =============================================================================
log "Creating environment configuration..."
ACCESS_PASSCODE=$(openssl rand -base64 16)

cat > ${APP_DIR}/.env <<EOF
# Production Environment Configuration
# Generated on $(date)

# Database
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

# API Configuration
PORT=${API_PORT}

# Security - SAVE THIS PASSCODE!
ACCESS_PASSCODE=${ACCESS_PASSCODE}

# CORS - Add your frontend domain(s)
CORS_ORIGINS=https://${DOMAIN},https://www.yourdomain.com

# Optional: Limit to specific states
STATES=
EOF

chmod 600 ${APP_DIR}/.env
chown ${APP_USER}:${APP_USER} ${APP_DIR}/.env

# Save credentials to a secure file
cat > /root/nursing-api-credentials.txt <<EOF
=== Nursing Layoff Radar Credentials ===
Generated: $(date)

Database:
  Host: localhost
  Port: 5432
  Database: ${DB_NAME}
  User: ${DB_USER}
  Password: ${DB_PASSWORD}
  Connection String: postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}

API:
  Port: ${API_PORT}
  Access Passcode: ${ACCESS_PASSCODE}
  Domain: ${DOMAIN}

IMPORTANT: Keep this file secure and delete after noting credentials!
EOF

chmod 600 /root/nursing-api-credentials.txt

log "Credentials saved to /root/nursing-api-credentials.txt"
warn "ACCESS PASSCODE: ${ACCESS_PASSCODE}"
warn "Save this passcode - you'll need it to log into the dashboard!"

# =============================================================================
# Step 8: Install Node Dependencies & Build
# =============================================================================
log "Installing Node.js dependencies..."
cd ${APP_DIR}

# Install root dependencies
npm install

# Build the API
cd ${APP_DIR}/apps/api
npm install
npm run build

# Set ownership
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# =============================================================================
# Step 9: Install Cloudflared
# =============================================================================
log "Installing Cloudflare Tunnel (cloudflared)..."
if ! command -v cloudflared &> /dev/null; then
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    dpkg -i cloudflared.deb
    rm cloudflared.deb
fi

# Create cloudflared user
if ! id -u cloudflared &>/dev/null; then
    useradd --system --shell /bin/false cloudflared
fi

# Create directories
mkdir -p /etc/cloudflared
mkdir -p /var/log/cloudflared
chown cloudflared:cloudflared /var/log/cloudflared

# =============================================================================
# Step 10: Setup Systemd Services
# =============================================================================
log "Setting up systemd services..."

# Copy service files
cp ${APP_DIR}/deploy/systemd/nursing-api.service /etc/systemd/system/
cp ${APP_DIR}/deploy/cloudflared/cloudflared.service /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start the API service
systemctl enable nursing-api
systemctl start nursing-api

log "API service started!"

# =============================================================================
# Step 11: Configure Firewall
# =============================================================================
log "Configuring firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
# Only allow API port from localhost (cloudflared connects locally)
ufw allow from 127.0.0.1 to any port ${API_PORT}
ufw --force enable

# =============================================================================
# Step 12: Cloudflare Tunnel Setup Instructions
# =============================================================================
echo ""
echo "============================================================================="
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo "============================================================================="
echo ""
echo "Next steps to complete Cloudflare Tunnel setup:"
echo ""
echo "1. Authenticate with Cloudflare:"
echo "   sudo -u cloudflared cloudflared tunnel login"
echo ""
echo "2. Create the tunnel:"
echo "   sudo -u cloudflared cloudflared tunnel create nursing-api"
echo ""
echo "3. Note the Tunnel ID from the output and update:"
echo "   /etc/cloudflared/config.yml"
echo ""
echo "4. Copy the config file:"
echo "   cp ${APP_DIR}/deploy/cloudflared/config.yml /etc/cloudflared/"
echo "   Edit /etc/cloudflared/config.yml with your TUNNEL_ID and domain"
echo ""
echo "5. Move the credentials file:"
echo "   mv ~/.cloudflared/<TUNNEL_ID>.json /etc/cloudflared/"
echo "   chown cloudflared:cloudflared /etc/cloudflared/<TUNNEL_ID>.json"
echo ""
echo "6. Create DNS record:"
echo "   cloudflared tunnel route dns nursing-api ${DOMAIN}"
echo ""
echo "7. Start the tunnel:"
echo "   systemctl enable cloudflared"
echo "   systemctl start cloudflared"
echo ""
echo "============================================================================="
echo "Credentials saved to: /root/nursing-api-credentials.txt"
echo "API Passcode: ${ACCESS_PASSCODE}"
echo "============================================================================="
echo ""
echo "Useful commands:"
echo "  Check API status:     systemctl status nursing-api"
echo "  Check tunnel status:  systemctl status cloudflared"
echo "  View API logs:        journalctl -u nursing-api -f"
echo "  View tunnel logs:     journalctl -u cloudflared -f"
echo ""
