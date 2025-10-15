# SentiCare Docker Makefile
# Simplifies common Docker operations

.PHONY: help setup start stop dev logs rebuild health mongo clean backup restore prod-update prod-deploy prod-scale

# Default target
help:
	@echo "SentiCare Docker Commands"
	@echo "========================"
	@echo ""
	@echo "Development:"
	@echo "  setup       - Setup environment files"
	@echo "  start       - Start all services"
	@echo "  dev         - Start in development mode"
	@echo "  stop        - Stop all services"
	@echo "  logs        - View logs (use LOGS=service for specific service)"
	@echo "  rebuild     - Rebuild services (use REBUILD=service for specific service)"
	@echo "  health      - Check service health"
	@echo "  mongo       - Connect to MongoDB shell"
	@echo ""
	@echo "Production:"
	@echo "  prod-deploy - Deploy production stack with Nginx"
	@echo "  prod-update - Update production deployment"
	@echo "  prod-scale  - Scale services (use SCALE=service:replicas)"
	@echo ""
	@echo "Maintenance:"
	@echo "  backup      - Backup database"
	@echo "  restore     - Restore database (use RESTORE=backup_file)"
	@echo "  clean       - Clean up Docker resources"

# Setup environment files
setup:
	@echo "Setting up environment files..."
	@if [ ! -f .env ]; then cp env.example .env; echo "Created .env file from template"; fi
	@if [ ! -f monitoring-backend/.env ]; then cp env.example monitoring-backend/.env; echo "Created backend .env file"; fi
	@if [ ! -f monitoring-frontend/.env ]; then cp env.example monitoring-frontend/.env; echo "Created frontend .env file"; fi
	@echo "Please update the .env files with your configuration values"

# Start all services
start:
	@echo "Starting all services..."
	docker-compose up --build -d
	@echo "Services started! Access at:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:5000"
	@echo "  MongoDB:  localhost:27017"

# Start in development mode
dev:
	@echo "Starting in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose down

# View logs
logs:
ifdef LOGS
	@echo "Viewing logs for $(LOGS)..."
	docker-compose logs -f $(LOGS)
else
	@echo "Viewing logs for all services..."
	docker-compose logs -f
endif

# Rebuild services
rebuild:
ifdef REBUILD
	@echo "Rebuilding $(REBUILD) service..."
	docker-compose up --build -d $(REBUILD)
else
	@echo "Rebuilding all services..."
	docker-compose up --build -d
endif

# Check health
health:
	@echo "Checking service health..."
	docker-compose ps
	@echo ""
	@echo "Health check endpoints:"
	@echo "  Backend:  http://localhost:5000/health"
	@echo "  Frontend: http://localhost:3000"

# Connect to MongoDB
mongo:
	@echo "Connecting to MongoDB shell..."
	docker-compose exec mongo mongosh -u admin -p password --authenticationDatabase admin monitoringdb

# Clean up
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Backup database
backup:
	@echo "Creating database backup..."
	@mkdir -p backups
	docker-compose exec -T mongo mongodump --uri="mongodb://admin:password@localhost:27017/monitoringdb?authSource=admin" --archive | gzip > backups/backup_$(shell date +%Y%m%d_%H%M%S).gz
	@echo "Backup created in backups/ directory"

# Restore database
restore:
ifndef RESTORE
	@echo "Usage: make restore RESTORE=backup_file.gz"
	@exit 1
endif
	@echo "Restoring database from $(RESTORE)..."
	gunzip -c $(RESTORE) | docker-compose exec -T mongo mongorestore --uri="mongodb://admin:password@localhost:27017/monitoringdb?authSource=admin" --archive

# Production deployment
prod-deploy:
	@echo "Deploying production stack..."
	docker-compose --profile production up --build -d
	@echo "Production stack deployed!"
	@echo "Access at: http://localhost"

# Update production
prod-update:
	@echo "Updating production deployment..."
	docker-compose --profile production pull
	docker-compose --profile production up --build -d

# Scale production services
prod-scale:
ifndef SCALE
	@echo "Usage: make prod-scale SCALE=service:replicas"
	@echo "Example: make prod-scale SCALE=backend:3"
	@exit 1
endif
	@echo "Scaling $(SCALE)..."
	@service=$$(echo $(SCALE) | cut -d: -f1); \
	replicas=$$(echo $(SCALE) | cut -d: -f2); \
	docker-compose --profile production up --scale $$service=$$replicas -d
