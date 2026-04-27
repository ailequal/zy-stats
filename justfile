default:
  @just --list

start:
  npm run start

start-log:
  npm run start -- --log

type-check:
  npm run type:check

lint-check:
  npm run lint:check

lint-fix:
  npm run lint:fix

fmt-check:
  npm run fmt:check

fmt-write:
  npm run fmt:write

docker-ps:
  docker compose ps

docker-build:
  docker compose build

docker-up-attached:
  docker compose up

docker-up-detached:
  docker compose up -d

docker-down:
  docker compose down

docker-rebuild:
  docker compose down
  docker compose build
  docker compose up -d

docker-shell:
  docker compose exec zy-stats /bin/bash

docker-logs:
  docker compose logs -f

docker-clean:
  docker compose down --rmi local --volumes --remove-orphans
