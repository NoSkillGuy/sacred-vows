.PHONY: build run test clean swagger

build: swagger
	go build -o bin/server ./cmd/server

run: swagger
	go run ./cmd/server

test:
	go test ./...

clean:
	rm -rf bin/

swagger:
	swag init -g cmd/server/main.go -o docs
