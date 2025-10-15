# SentiCare Docker Setup Guide

This guide provides comprehensive instructions for Dockerizing and running the SentiCare Hospital Monitoring System.

## 📁 Project Structure

```
senticare/
├── monitoring-backend/          # Node.js Express API
│   ├── Dockerfile              # Backend container configuration
│   ├── .dockerignore           # Backend ignore patterns
│   └── .env.example            # Backend environment template
├── monitoring-frontend/         # Next.js React App
│   ├── Dockerfile              # Frontend container configuration
│   ├── .dockerignore           # Frontend ignore patterns
│   └── .env.example            # Frontend environment template
├── nginx/                      # Nginx reverse proxy
│   └── nginx.conf              # Nginx configuration
├── scripts/                    # Helper scripts
│   ├── docker-dev.sh           # Development operations
│   └── docker-prod.sh          # Production operations
├── docker-compose.yml          # Main orchestration file
├── docker-compose.dev.yml      # Development overrides
├── env.example                 # Root environment template
└── DOCKER.md                   # This documentation
```

## 🚀 Quick Start

### 1. Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+
- Git

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your values
# Important: Change default passwords and secrets!
```

### 3. Run the Application

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Health Check**: http://localhost:5000/health

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory with these variables:

```env
# Environment
NODE_ENV=production

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password_here
MONGO_DB_NAME=monitoringdb

# JWT Secrets (generate strong secrets!)
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Frontend URLs
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Production with Nginx

For production deployment with Nginx reverse proxy:

```bash
# Start with Nginx
docker-compose --profile production up --build -d
```

This will:
- Route all traffic through Nginx on port 80
- API requests go to `/api/*`
- WebSocket connections to `/socket.io/*`
- Frontend served from root `/`

## 📋 Available Commands

### Basic Docker Compose Commands

```bash
# Start all services
docker-compose up --build

# Start in detached mode
docker-compose up --build -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Check service status
docker-compose ps

# Rebuild specific service
docker-compose up --build backend
```

### Development Commands

```bash
# Start in development mode (with hot reload)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or use the helper script (Linux/Mac)
./scripts/docker-dev.sh dev
```

### Production Commands

```bash
# Deploy production stack
docker-compose --profile production up --build -d

# Update production deployment
docker-compose --profile production pull
docker-compose --profile production up --build -d

# Scale services
docker-compose --profile production up --scale backend=3 -d
```

## 🔍 Service Details

### Backend Service

- **Image**: Built from `monitoring-backend/Dockerfile`
- **Port**: 5000
- **Health Check**: `/health` endpoint
- **Dependencies**: MongoDB
- **Features**:
  - Multi-stage build for optimization
  - Non-root user for security
  - Health checks
  - Graceful shutdown handling

### Frontend Service

- **Image**: Built from `monitoring-frontend/Dockerfile`
- **Port**: 3000
- **Dependencies**: Backend
- **Features**:
  - Next.js standalone output
  - Multi-stage build
  - Static file optimization
  - Health checks

### MongoDB Service

- **Image**: mongo:7.0
- **Port**: 27017
- **Data Persistence**: Named volume `mongo_data`
- **Features**:
  - Authentication enabled
  - Health checks
  - Data persistence

### Nginx Service (Production)

- **Image**: nginx:alpine
- **Ports**: 80, 443
- **Features**:
  - Reverse proxy
  - Load balancing
  - SSL termination
  - Rate limiting
  - Gzip compression

## 🛠️ Development Workflow

### Hot Reloading

For development with hot reloading:

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or rebuild specific service
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build backend
```

### Code Changes

1. Make changes to your code
2. The development containers will automatically reload
3. For backend: Nodemon will restart the server
4. For frontend: Next.js will hot-reload

### Debugging

```bash
# View real-time logs
docker-compose logs -f backend

# Connect to running container
docker-compose exec backend sh

# Check container resources
docker stats
```

## 🔒 Security Considerations

### Production Security

1. **Change Default Passwords**: Update MongoDB credentials
2. **Strong JWT Secrets**: Use cryptographically strong secrets
3. **Environment Variables**: Never commit `.env` files
4. **SSL/TLS**: Configure SSL certificates for HTTPS
5. **Firewall**: Restrict access to necessary ports only

### SSL Configuration

To enable HTTPS in production:

1. Place SSL certificates in `nginx/ssl/`:
   - `cert.pem` (certificate)
   - `key.pem` (private key)

2. Uncomment HTTPS server block in `nginx/nginx.conf`

3. Update environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api
   ```

## 📊 Monitoring and Maintenance

### Health Checks

```bash
# Check all services
docker-compose ps

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:3000
```

### Database Operations

```bash
# Connect to MongoDB shell
docker-compose exec mongo mongosh -u admin -p password --authenticationDatabase admin monitoringdb

# Backup database
docker-compose exec mongo mongodump --uri="mongodb://admin:password@localhost:27017/monitoringdb?authSource=admin" --archive > backup.gz

# Restore database
gunzip -c backup.gz | docker-compose exec -T mongo mongorestore --uri="mongodb://admin:password@localhost:27017/monitoringdb?authSource=admin" --archive
```

### Log Management

```bash
# View logs with timestamps
docker-compose logs -f -t

# Follow logs for specific service
docker-compose logs -f backend

# Save logs to file
docker-compose logs > application.log
```

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Check what's using the port
netstat -tulpn | grep :5000

# Kill process using port (Linux/Mac)
sudo kill -9 $(lsof -t -i:5000)

# On Windows, use Task Manager or:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 2. MongoDB Connection Issues

```bash
# Check MongoDB logs
docker-compose logs mongo

# Restart MongoDB service
docker-compose restart mongo

# Check MongoDB connectivity
docker-compose exec backend node -e "console.log('Testing MongoDB connection...')"
```

#### 3. Build Failures

```bash
# Clean build cache
docker-compose build --no-cache

# Remove all containers and rebuild
docker-compose down
docker-compose up --build --force-recreate
```

#### 4. Permission Issues

```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .

# Rebuild with no cache
docker-compose build --no-cache
```

### Debug Mode

```bash
# Start with debug logging
DEBUG=* docker-compose up

# Enable verbose Docker output
DOCKER_BUILDKIT=0 docker-compose up --build
```

## 📈 Performance Optimization

### Build Optimization

- Multi-stage builds reduce final image size
- Dependency caching speeds up rebuilds
- `.dockerignore` files exclude unnecessary files

### Runtime Optimization

- Use production-ready base images (Alpine Linux)
- Non-root users for security
- Health checks for reliability
- Resource limits in production

### Scaling

```bash
# Scale backend service
docker-compose up --scale backend=3

# Scale with load balancer
docker-compose --profile production up --scale backend=3
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy with Docker Compose
        run: |
          docker-compose --profile production up --build -d
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Nginx Docker Hub](https://hub.docker.com/_/nginx)

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Docker and service logs
3. Verify environment configuration
4. Check network connectivity between services

---

**Happy Dockerizing! 🐳**
