#!/bin/bash

# Docker Production Script for SentiCare
# This script helps with production Docker deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Validate environment
validate_env() {
    print_status "Validating environment configuration..."
    
    if [ ! -f .env ]; then
        print_error ".env file not found. Please create one from env.example"
        exit 1
    fi
    
    # Check required environment variables
    required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "MONGO_ROOT_PASSWORD")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" .env || grep -q "^$var=your_" .env; then
            print_error "Please set $var in your .env file"
            exit 1
        fi
    done
    
    print_success "Environment validation passed"
}

# Deploy production stack
deploy() {
    print_status "Deploying production stack..."
    validate_env
    
    # Build and start with production profile (includes Nginx)
    docker-compose --profile production up --build -d
    
    print_success "Production stack deployed successfully!"
    print_status "Services available at:"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost/api"
    echo "  Health Check: http://localhost/health"
}

# Update deployment
update() {
    print_status "Updating production deployment..."
    validate_env
    
    # Pull latest images and rebuild
    docker-compose --profile production pull
    docker-compose --profile production up --build -d
    
    print_success "Production deployment updated!"
}

# Scale services
scale() {
    local service=${1:-}
    local replicas=${2:-2}
    
    if [ -z "$service" ]; then
        print_error "Please specify a service name (backend|frontend)"
        exit 1
    fi
    
    print_status "Scaling $service to $replicas replicas..."
    docker-compose --profile production up --scale "$service=$replicas" -d
    
    print_success "$service scaled to $replicas replicas"
}

# Backup database
backup_db() {
    local backup_file="backup_$(date +%Y%m%d_%H%M%S).gz"
    
    print_status "Creating database backup..."
    docker-compose exec -T mongo mongodump --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/monitoringdb?authSource=admin" --archive | gzip > "$backup_file"
    
    print_success "Database backup created: $backup_file"
}

# Restore database
restore_db() {
    local backup_file=${1:-}
    
    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        print_error "Please specify a valid backup file"
        exit 1
    fi
    
    print_warning "This will restore the database from $backup_file. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Restoring database from $backup_file..."
        gunzip -c "$backup_file" | docker-compose exec -T mongo mongorestore --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/monitoringdb?authSource=admin" --archive
        print_success "Database restored successfully!"
    else
        print_status "Database restore cancelled."
    fi
}

# Monitor services
monitor() {
    print_status "Monitoring production services..."
    watch -n 2 'docker-compose --profile production ps && echo "" && docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"'
}

# Security scan
security_scan() {
    print_status "Running security scan on images..."
    
    # Check if trivy is installed
    if ! command -v trivy &> /dev/null; then
        print_warning "Trivy not installed. Install it for security scanning."
        print_status "You can install it with: curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh"
        return
    fi
    
    services=("backend" "frontend" "mongo" "nginx")
    for service in "${services[@]}"; do
        print_status "Scanning $service image..."
        trivy image "senticare_${service}_latest" || true
    done
}

# Health check
health_check() {
    print_status "Running comprehensive health check..."
    
    # Check if services are running
    docker-compose --profile production ps
    
    echo ""
    print_status "Testing endpoints..."
    
    # Test backend health
    if curl -f -s http://localhost/health > /dev/null; then
        print_success "Backend health check passed"
    else
        print_error "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f -s http://localhost > /dev/null; then
        print_success "Frontend health check passed"
    else
        print_error "Frontend health check failed"
    fi
    
    # Test MongoDB connection
    if docker-compose exec mongo mongosh --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "MongoDB health check passed"
    else
        print_error "MongoDB health check failed"
    fi
}

# Show logs
show_logs() {
    local service=${1:-}
    local lines=${2:-100}
    
    if [ -n "$service" ]; then
        print_status "Showing last $lines lines of $service logs..."
        docker-compose --profile production logs --tail="$lines" -f "$service"
    else
        print_status "Showing last $lines lines of all logs..."
        docker-compose --profile production logs --tail="$lines" -f
    fi
}

# Show usage
show_usage() {
    echo "SentiCare Docker Production Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy      - Deploy production stack"
    echo "  update      - Update production deployment"
    echo "  scale       - Scale services (backend|frontend) [replicas]"
    echo "  backup      - Backup database"
    echo "  restore     - Restore database from backup file"
    echo "  monitor     - Monitor production services"
    echo "  security    - Run security scan on images"
    echo "  health      - Run comprehensive health check"
    echo "  logs        - Show logs (optionally specify service) [lines]"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy"
    echo "  $0 update"
    echo "  $0 scale backend 3"
    echo "  $0 backup"
    echo "  $0 restore backup_20240101_120000.gz"
    echo "  $0 logs backend 50"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        deploy)
            deploy
            health_check
            ;;
        update)
            update
            health_check
            ;;
        scale)
            scale "$2" "$3"
            ;;
        backup)
            backup_db
            ;;
        restore)
            restore_db "$2"
            ;;
        monitor)
            monitor
            ;;
        security)
            security_scan
            ;;
        health)
            health_check
            ;;
        logs)
            show_logs "$2" "$3"
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
