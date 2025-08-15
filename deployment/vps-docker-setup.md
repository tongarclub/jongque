# 🐳 VPS + Docker Deployment Guide

## Recommended VPS Providers

### Budget Options
- **Vultr**: $6/month (1GB RAM, 25GB SSD)
- **Linode**: $5/month (1GB RAM, 25GB SSD) 
- **Digital Ocean**: $6/month (1GB RAM, 25GB SSD)

### Performance Options  
- **AWS EC2**: $10+/month (t3.micro)
- **Google Cloud**: $10+/month
- **Azure**: $10+/month

## Step 1: Setup VPS

```bash
# Login to your VPS
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Start Docker
systemctl start docker
systemctl enable docker
```

## Step 2: Domain Setup

1. **Buy domain** (Namecheap, Cloudflare)
2. **Point A record** to your VPS IP
3. **Setup subdomain** (optional):
   - `api.yourdomain.com` → VPS IP
   - `app.yourdomain.com` → VPS IP

## Step 3: Deploy Application

```bash
# Clone your repo
git clone https://github.com/yourusername/jongque.git
cd jongque

# Setup environment
cp production.env .env.prod
nano .env.prod  # Edit with your values

# Deploy
./scripts/docker-prod.sh
```

## Step 4: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 5: Backup Setup

```bash
# Create backup script
cat > /root/backup-jongque.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f /path/to/jongque/docker-compose.prod.yml exec -T postgres pg_dump -U postgres jongque > /backups/jongque_$DATE.sql
find /backups -name "jongque_*.sql" -mtime +7 -delete
EOF

chmod +x /root/backup-jongque.sh

# Schedule backup
crontab -e
# Add: 0 2 * * * /root/backup-jongque.sh
```

## Step 6: Monitoring

```bash
# Install monitoring
apt install htop netdata -y

# View logs
docker-compose logs -f app

# Check resources
htop
df -h
```

## Security Setup

```bash
# Setup firewall
ufw enable
ufw allow ssh
ufw allow 80
ufw allow 443

# Disable root login (optional)
nano /etc/ssh/sshd_config
# Change: PermitRootLogin no
systemctl restart ssh

# Update regularly
apt install unattended-upgrades -y
```

## Management Commands

```bash
# Update application
cd /path/to/jongque
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# View status
docker-compose -f docker-compose.prod.yml ps

# Restart services
docker-compose -f docker-compose.prod.yml restart app

# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres jongque > backup.sql
```

## Costs Breakdown

### Monthly Costs
- **VPS**: $5-10/month
- **Domain**: $1-2/month
- **SSL**: Free (Let's Encrypt)
- **Backup Storage**: $1-5/month
- **Total**: $7-17/month

### One-time Costs
- **Domain**: $10-15/year
- **Setup Time**: 2-4 hours
