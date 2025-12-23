.PHONY: build run dev test clean swagger build-cleanup cleanup

build: swagger
	go build -o bin/server ./cmd/server

build-cleanup:
	go build -o bin/cleanup ./cmd/cleanup

run: swagger
	go run ./cmd/server

dev: swagger
	@which air > /dev/null || (echo "Error: Air is not installed. Install it with: go install github.com/cosmtrek/air@latest" && exit 1)
	air

test:
	go test ./...

clean:
	rm -rf bin/

swagger:
	swag init -g cmd/server/main.go -o docs

# Run cleanup job (dry-run by default)
cleanup: build-cleanup
	./bin/cleanup -dry-run=true

# Run cleanup job and actually delete orphaned assets
cleanup-exec: build-cleanup
	./bin/cleanup -dry-run=false
