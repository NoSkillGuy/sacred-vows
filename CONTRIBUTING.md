# Contributing to Sacred Vows

Thank you for your interest in contributing to Sacred Vows! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sacred-vows.git
   cd sacred-vows
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/NoSkillGuy/sacred-vows.git
   ```

## Development Setup

Please refer to the [Getting Started Guide](./docs/getting-started/README.md) for detailed setup instructions.

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+ (for the API server)
- Docker and Docker Compose (for local services)
- Git

### Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `apps/api-go/env.example` to `apps/api-go/.env`
   - Copy `apps/builder/env.example` to `apps/builder/.env`
   - Fill in the required values

3. Start local services:
   ```bash
   docker-compose up -d
   ```

4. Run the development servers:
   ```bash
   # Terminal 1: API server
   cd apps/api-go && make run

   # Terminal 2: Builder app
   cd apps/builder && npm run dev
   ```

## Making Changes

### Branch Naming

Create a new branch for your changes:
```bash
git checkout -b type/description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes
- `chore/` - Maintenance tasks

Examples:
- `feature/add-rsvp-form`
- `fix/auth-token-expiration`
- `docs/update-api-docs`

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

Examples:
```
feat(builder): add drag-and-drop component editor

fix(api): handle expired refresh tokens correctly

docs: update deployment guide with new steps
```

## Submitting Changes

1. **Keep your branch up to date**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and linting**:
   ```bash
   npm test
   npm run lint
   ```

3. **Commit your changes** following the commit message format

4. **Push to your fork**:
   ```bash
   git push origin your-branch-name
   ```

5. **Create a Pull Request** on GitHub:
   - Fill out the PR template
   - Link any related issues
   - Request review from maintainers

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint` to check)
- Format code with Prettier (run `npm run format`)
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### Go

- Follow `gofmt` formatting
- Run `go vet` before committing
- Follow Go best practices and idioms
- Add comments for exported functions and types

### General

- Write self-documenting code
- Keep functions small and focused
- Avoid deep nesting
- Handle errors explicitly
- Add comments for complex logic

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific app tests
npm run test:go
npm run test:builder
npm run test:edge-worker
```

### Writing Tests

- Write tests for new features and bug fixes
- Aim for good test coverage
- Use descriptive test names
- Follow existing test patterns

See [Testing Strategy](./docs/development/testing-strategy.md) for more details.

## Documentation

- Update documentation when adding features or changing behavior
- Use clear, concise language
- Follow the existing documentation structure
- Add code examples where helpful
- Update README files if needed

## Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. Address review feedback promptly
4. Keep PRs focused and reasonably sized
5. Squash commits before merging (if requested)

## Questions?

- Check the [documentation](./docs/)
- Open an issue for questions or discussions
- Reach out to maintainers

Thank you for contributing to Sacred Vows! 🎉

