# List all available commands
default:
  @just --list

# Start the app
start:
  npm run start

# Start the app with logging enabled
start-log:
  npm run start -- --log

# Run TypeScript type checking
type-check:
  npm run type:check

# Run the linter in check mode
lint-check:
  npm run lint:check

# Run the linter and auto-fix issues
lint-fix:
  npm run lint:fix

# Check formatting without writing changes
fmt-check:
  npm run fmt:check

# Format source files and write changes
fmt-write:
  npm run fmt:write

# Show running Docker Compose services
docker-ps:
  docker compose ps

# Build Docker images
docker-build:
  docker compose build

# Start services in the foreground
docker-up-attached:
  docker compose up

# Start services in the background
docker-up-detached:
  docker compose up -d

# Stop and remove containers
docker-down:
  docker compose down

# Rebuild images and restart services
docker-rebuild:
  docker compose down
  docker compose build
  docker compose up -d

# Open a shell inside the running container
docker-shell:
  docker compose exec zy-stats /bin/bash

# Show last recorded JSON logs
show-logs:
  @cat logs/$(date +%Y-%m-%d).log 2>/dev/null || echo "No log file found for today."

# Print container logs once without following
docker-logs-once:
  -docker compose logs

# Follow live container logs
docker-logs:
  -docker compose logs -f

# Remove containers, images, volumes, and orphans
docker-clean:
  docker compose down --rmi local --volumes --remove-orphans

# Delete log files older than 30 days
logs-clean:
  find logs/ -name "*.log" -mtime +30 -delete
