.PHONY: build run test clean migrate-up migrate-down swagger

build: swagger
	go build -o bin/server ./cmd/server

run: swagger
	go run ./cmd/server

test:
	go test ./...

clean:
	rm -rf bin/

migrate-up:
	migrate -path migrations -database "$(DATABASE_URL)" up

migrate-down:
	migrate -path migrations -database "$(DATABASE_URL)" down

swagger:
	swag init -g cmd/server/main.go -o docs
