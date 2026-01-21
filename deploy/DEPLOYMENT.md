# Deployment Guide - Nursing Layoff Radar

## Quick Start Options

### Option 1: Automated Setup (Recommended for VPS)

1. **Get a VPS** (DigitalOcean, Linode, AWS EC2, etc.)
   - Ubuntu 22.04 LTS recommended
   - Minimum: 1 vCPU, 1GB RAM, 20GB disk

2. **Upload your code** to the server:
   ```bash
   scp -r ./nursing-layoff-radar root@your-server-ip:/opt/
   ```

3. **Run the setup script**:
   ```bash
   ssh root@your-server-ip
   cd /opt/nursing-layoff-radar
   chmod +x deploy/setup.sh
   ./deploy/setup.sh
   ```

4. **Complete Cloudflare Tunnel setup** (follow on-screen instructions)

---

### Option 2: Manual Setup

#### Prerequisites
- Ubuntu/Debian server
- Domain added to Cloudflare

#### Step 1: Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 2: Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createuser --interactive  # Create 'nlr' user
sudo -u postgres createdb nlr              # Create 'nlr' database
```

#### Step 3: Clone and Build
```bash
cd /opt
git clone https://github.com/your-repo/nursing-layoff-radar.git
cd nursing-layoff-radar

# Install dependencies
npm install
cd apps/api && npm install && npm run build
```

#### Step 4: Configure Environment
```bash
cp .env.example .env
nano .env  # Edit with your values

# Generate secure passcode
openssl rand -base64 16
```

#### Step 5: Install Cloudflared
```bash
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

#### Step 6: Create Tunnel
```bash
cloudflared tunnel login
cloudflared tunnel create nursing-api
# Note the Tunnel ID!
```

#### Step 7: Configure Tunnel
```bash
sudo mkdir -p /etc/cloudflared
sudo cp deploy/cloudflared/config.yml /etc/cloudflared/
sudo nano /etc/cloudflared/config.yml  # Add your Tunnel ID and domain
```

#### Step 8: Setup Services
```bash
sudo cp deploy/systemd/nursing-api.service /etc/systemd/system/
sudo cp deploy/cloudflared/cloudflared.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable nursing-api cloudflared
sudo systemctl start nursing-api cloudflared
```

#### Step 9: Create DNS Record
```bash
cloudflared tunnel route dns nursing-api api.yourdomain.com
```

---

### Option 3: Docker Deployment

```bash
# Build and run with Docker Compose
cd /opt/nursing-layoff-radar
docker-compose -f deploy/docker-compose.yml up -d
```

---

## Cloudflare Dashboard Setup

1. **Add your domain** to Cloudflare (if not already)

2. **SSL/TLS Settings**:
   - Go to SSL/TLS → Overview
   - Set mode to "Full (strict)"

3. **Security Settings**:
   - Enable "Always Use HTTPS"
   - Enable "Automatic HTTPS Rewrites"

4. **Firewall Rules** (optional):
   - Create rules to block suspicious traffic
   - Enable Bot Fight Mode

---

## Verify Deployment

1. **Check API health**:
   ```bash
   curl https://api.yourdomain.com/health
   # Should return: {"ok":true,"db":true}
   ```

2. **Check services**:
   ```bash
   sudo systemctl status nursing-api
   sudo systemctl status cloudflared
   ```

3. **View logs**:
   ```bash
   sudo journalctl -u nursing-api -f
   sudo journalctl -u cloudflared -f
   ```

---

## Troubleshooting

### API won't start
```bash
# Check logs
journalctl -u nursing-api -n 50

# Common issues:
# - Missing .env file
# - Database connection failed
# - Port already in use
```

### Tunnel not connecting
```bash
# Check cloudflared logs
journalctl -u cloudflared -n 50

# Verify config
cloudflared tunnel info nursing-api
```

### Database connection issues
```bash
# Test connection
psql -U nlr -d nlr -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

---

## Security Checklist

- [ ] Strong ACCESS_PASSCODE (16+ characters)
- [ ] Database password is unique and strong
- [ ] Firewall configured (only 80/443 open)
- [ ] SSL/TLS set to "Full (strict)" in Cloudflare
- [ ] CORS_ORIGINS set to your specific domain(s)
- [ ] .env file has restricted permissions (chmod 600)
- [ ] Regular security updates enabled
