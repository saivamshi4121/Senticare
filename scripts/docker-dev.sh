#!/bin/bash

# Docker Development Script for SentiCare
# This script helps with common Docker development tasks

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

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_warning "Created .env file from env.example. Please update the values."
    else
        print_status ".env file already exists."
    fi
    
    if [ ! -f monitoring-backend/.env ]; then
        cp env.example monitoring-backend/.env
        print_warning "Created monitoring-backend/.env file. Please update the values."
    fi
    
    if [ ! -f monitoring-frontend/.env ]; then
        cp env.example monitoring-frontend/.env
        print_warning "Created monitoring-frontend/.env file. Please update the values."
    fi
}

# Build and start all services
start_all() {
    print_status "Building and starting all services..."
    docker-compose up --build -d
    print_success "All services started successfully!"
}

# Start in development mode
start_dev() {
    print_status "Starting services in development mode..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
}

# Stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped."
}

# View logs
view_logs() {
    local service=${1:-}
    if [ -n "$service" ]; then
        print_status "Viewing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Viewing logs for all services..."
        docker-compose logs -f
    fi
}

# Rebuild specific service
rebuild_service() {
    local service=${1:-}
    if [ -z "$service" ]; then
        print_error "Please specify a service name (backend, frontend, mongo, nginx)"
        exit 1
    fi
    
    print_status "Rebuilding $service service..."
    docker-compose up --build -d "$service"
    print_success "$service service rebuilt successfully!"
}

# Check service health
check_health() {
    print_status "Checking service health..."
    docker-compose ps
    echo ""
    print_status "Health check endpoints:"
    echo "  Backend: http://localhost:5000/health"
    echo "  Frontend: http://localhost:3000"
    echo "  MongoDB: localhost:27017"
}

# Clean up Docker resources
cleanup() {
    print_warning "This will remove all containers, networks, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Connect to MongoDB shell
connect_mongo() {
    print_status "Connecting to MongoDB shell..."
    docker-compose exec mongo mongosh -u admin -p password --authenticationDatabase admin monitoringdb
}

# Show usage
show_usage() {
    echo "SentiCare Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup environment files"
    echo "  start     - Build and start all services"
    echo "  dev       - Start in development mode"
    echo "  stop      - Stop all services"
    echo "  logs      - View logs (optionally specify service name)"
    echo "  rebuild   - Rebuild specific service (backend|frontend|mongo|nginx)"
    echo "  health    - Check service health"
    echo "  mongo     - Connect to MongoDB shell"
    echo "  cleanup   - Clean up Docker resources"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 start"
    echo "  $0 logs backend"
    echo "  $0 rebuild frontend"
    echo "  $0 mongo"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        setup)
            setup_env
            ;;
        start)
            setup_env
            start_all
            check_health
            ;;
        dev)
            setup_env
            start_dev
            ;;
        stop)
            stop_all
            ;;
        logs)
            view_logs "$2"
            ;;
        rebuild)
            rebuild_service "$2"
            ;;
        health)
            check_health
            ;;
        mongo)
            connect_mongo
            ;;
        cleanup)
            cleanup
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
