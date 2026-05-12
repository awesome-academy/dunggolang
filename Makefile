.PHONY: db-up db-down run-backend run-frontend

# Database commands
db-up:
	docker compose up -d

db-down:
	docker compose down

# Backend commands
run-backend:
	cd backend && go run main.go

# Frontend commands
run-frontend:
	cd frontend && pnpm run dev

# Run everything (DB, backend, frontend - requires multiple terminals or tools like tmux, but helpful for reference)
setup:
	cd backend && go mod tidy
	cd frontend && pnpm install

