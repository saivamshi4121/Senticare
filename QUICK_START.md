# 🐳 SentiCare Docker Quick Start Guide

## ⚡ Quick Commands

### Start Everything
```bash
# Setup and start all services
make setup && make start

# Or manually:
cp env.example .env
# Edit .env with your values
docker-compose up --build
```

### Development Mode
```bash
# Hot reloading for development
make dev

# Or manually:
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production Mode
```bash
# Deploy with Nginx reverse proxy
make prod-deploy

# Or manually:
docker-compose --profile production up --build -d
```

## 🔗 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **MongoDB**: localhost:27017

With Nginx (Production):
- **Application**: http://localhost
- **API**: http://localhost/api
- **Health**: http://localhost/health

## 🛠️ Essential Commands

```bash
# View logs
make logs                    # All services
make logs LOGS=backend       # Backend only

# Rebuild services
make rebuild                 # All services
make rebuild REBUILD=backend # Backend only

# Health check
make health

# Connect to MongoDB
make mongo

# Stop everything
make stop

# Clean up
make clean
```

## 🔧 Environment Setup

1. **Copy environment template**:
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` file** with your values:
   ```env
   JWT_SECRET=your_32_character_secret_here
   JWT_REFRESH_SECRET=your_32_character_secret_here
   MONGO_ROOT_PASSWORD=your_secure_password
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Start services**:
   ```bash
   make start
   ```

## 📊 Monitoring

```bash
# Check service status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats

# Health checks
curl http://localhost:5000/health
```

## 🔄 Development Workflow

1. **Start development environment**:
   ```bash
   make dev
   ```

2. **Make code changes** - containers auto-reload

3. **View logs** if needed:
   ```bash
   make logs LOGS=backend
   ```

4. **Rebuild if dependencies change**:
   ```bash
   make rebuild REBUILD=backend
   ```

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
sudo kill -9 $(lsof -t -i:5000)
```

### Container Issues
```bash
# Restart specific service
docker-compose restart backend

# Rebuild with no cache
docker-compose build --no-cache backend

# Clean restart
make stop && make start
```

### Database Issues
```bash
# Check MongoDB logs
docker-compose logs mongo

# Connect to database
make mongo

# Backup database
make backup
```

## 📈 Production Deployment

1. **Configure environment**:
   ```bash
   cp env.example .env
   # Update production values in .env
   ```

2. **Deploy with Nginx**:
   ```bash
   make prod-deploy
   ```

3. **Scale services**:
   ```bash
   make prod-scale SCALE=backend:3
   ```

4. **Monitor**:
   ```bash
   docker-compose --profile production ps
   curl http://localhost/health
   ```

## 🔐 Security Checklist

- [ ] Change default MongoDB password
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Set up SSL certificates for HTTPS
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

---

**That's it! Your SentiCare application is now fully Dockerized! 🎉**

For detailed information, see [DOCKER.md](./DOCKER.md)
