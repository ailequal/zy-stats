# List all available commands grouped by category
default:
  @awk ' \
    /^# ---/ { print "\n\033[1;33m" $0 "\033[0m" } \
    /^# [^-]/ { desc = substr($0, 3) } \
    /^[a-zA-Z0-9_-]+:([^=]|$)/ { \
      name = substr($1, 1, index($1, ":")-1); \
      if (name != "default" && desc != "") { \
        printf "  \033[36m%-25s\033[0m %s\n", name, desc; \
      } \
      desc = "" \
    } \
    END { print "" } \
  ' "{{justfile()}}"

# --- Local ---

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

# --- Docker (production) ---

# Compose shorthand for prod commands
prod_compose := "docker compose -f docker-compose.yml -f docker-compose.prod.yml"

# Show running Docker Compose services
docker-ps:
  {{ prod_compose }} ps

# Build Docker images
docker-build:
  {{ prod_compose }} build

# Start services in the foreground
docker-up-attached:
  {{ prod_compose }} up

# Start services in the background
docker-up-detached:
  {{ prod_compose }} up -d

# Run the app once with logging enabled
docker-start-log:
  {{ prod_compose }} run --rm zy-stats node --env-file=.env src/app.ts --log

# Stop and remove containers
docker-down:
  {{ prod_compose }} down

# Rebuild images and restart services
docker-rebuild:
  {{ prod_compose }} down
  {{ prod_compose }} build
  {{ prod_compose }} up -d

# Open a shell inside the running container
docker-shell:
  {{ prod_compose }} exec zy-stats /bin/bash

# Print container logs once without following
docker-logs-once:
  -{{ prod_compose }} logs

# Follow live container logs
docker-logs:
  -{{ prod_compose }} logs -f

# Remove containers, images, volumes, and orphans
docker-clean:
  {{ prod_compose }} down --rmi local --volumes --remove-orphans

# --- Docker (development) ---

# Build the development Docker image
docker-dev-build:
  docker compose build

# Start the dev container in the foreground
docker-dev-up-attached:
  docker compose up

# Start the dev container in the background
docker-dev-up-detached:
  docker compose up -d

# Run the app once with logging enabled
docker-dev-start-log:
  docker compose run --rm zy-stats node --env-file=.env src/app.ts --log

# Stop and remove the dev container
docker-dev-down:
  docker compose down

# Rebuild the dev image and restart
docker-dev-rebuild:
  docker compose down
  docker compose build
  docker compose up -d

# Open a shell inside the running dev container
docker-dev-shell:
  docker compose exec zy-stats /bin/bash

# Run TypeScript type checking inside the dev container
docker-dev-type-check:
  docker compose run --rm zy-stats npm run type:check

# Run the linter in check mode inside the dev container
docker-dev-lint-check:
  docker compose run --rm zy-stats npm run lint:check

# Run the linter and auto-fix issues inside the dev container
docker-dev-lint-fix:
  docker compose run --rm zy-stats npm run lint:fix

# Check formatting inside the dev container
docker-dev-fmt-check:
  docker compose run --rm zy-stats npm run fmt:check

# Format source files inside the dev container
docker-dev-fmt-write:
  docker compose run --rm zy-stats npm run fmt:write

# Print dev container logs once without following
docker-dev-logs-once:
  -docker compose logs

# Follow live dev container logs
docker-dev-logs:
  -docker compose logs -f

# Remove dev containers, images, volumes, and orphans
docker-dev-clean:
  docker compose down --rmi local --volumes --remove-orphans

# --- Logs ---

# Show last recorded JSON logs
show-logs:
  @cat logs/$(date +%Y-%m-%d).log 2>/dev/null || echo "No log file found for today."

# Delete log files older than 30 days
logs-clean:
  find logs/ -name "*.log" -mtime +30 -delete
