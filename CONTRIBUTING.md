# Contributing to Social Media CLI

Thank you for your interest in contributing to the Social Media CLI project! We welcome contributions from the community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please be respectful and professional in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Set up the development environment
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- TypeScript knowledge

### Setup Steps
//TODO: verify path
```bash
# Clone your fork
git clone https://github.com/Abdo_Ka/social-media-cli.git
cd social-media-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Environment Configuration

Create a `.env` file for testing (never commit this file):

```bash
# Add your test API credentials
FACEBOOK_ACCESS_TOKEN=your_test_token
# ... other test credentials
```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **Bug Reports**: Found a bug? Please report it!
2. **Feature Requests**: Have an idea for a new feature?
3. **Code Contributions**: Bug fixes, new features, improvements
4. **Documentation**: Improve docs, add examples, fix typos
5. **Testing**: Add test cases, improve test coverage

### Before You Start

- Check existing issues to avoid duplicates
- For major changes, open an issue first to discuss
- Ensure your contribution aligns with project goals

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a clear, descriptive title
   - Include a detailed description
   - Reference any related issues

### Pull Request Requirements

- All tests must pass
- Code must be properly typed (TypeScript)
- Follow the existing code style
- Include appropriate documentation
- Add tests for new features

## Issue Guidelines

### Bug Reports

When reporting bugs, please include:

- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Your environment (OS, Node.js version, etc.)
- Relevant logs or error messages
- Minimal code example if possible

### Feature Requests

For feature requests, please include:

- Clear description of the feature
- Use case or problem it solves
- Proposed implementation approach
- Any alternatives considered

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Properly type all functions and variables
- Use interfaces for object shapes
- Follow existing naming conventions

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Use meaningful variable and function names
- Add JSDoc comments for public functions

### File Organization

```typescript
// Import order:
// 1. Node.js built-in modules
// 2. Third-party modules
// 3. Local modules (relative imports)

import { promises as fs } from 'fs';
import chalk from 'chalk';
import { PostOptions } from '../types/index.js';
```

### Error Handling

```typescript
// Use proper error handling
try {
  await someAsyncOperation();
} catch (error: any) {
  logger.error('Operation failed', { error: error.message });
  throw new Error(`Failed to execute operation: ${error.message}`);
}
```

## Testing Guidelines

### Test Structure

- Place tests in the `tests/` directory
- Use Jest for testing framework
- Follow the existing test patterns
- Test both success and error cases

### Test Categories

1. **Unit Tests**: Test individual functions/classes
2. **Integration Tests**: Test component interactions
3. **CLI Tests**: Test command-line interface

### Writing Tests

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup code
  });

  it('should handle valid input correctly', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });

  it('should throw error for invalid input', async () => {
    await expect(invalidOperation()).rejects.toThrow('Expected error message');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Platform-Specific Contributions

### Adding New Platforms

1. Create interface in `src/types/index.ts`
2. Implement platform class in `src/platforms/`
3. Add to platform registry
4. Write comprehensive tests
5. Update documentation

### Platform Implementation Template

```typescript
export class NewPlatformHandler implements PlatformInterface {
  async post(content: PostContent): Promise<PostResult> {
    // Implementation
  }

  async validateCredentials(): Promise<boolean> {
    // Implementation
  }
}
```

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include parameter and return type descriptions
- Provide usage examples for complex functions

### README Updates

- Keep examples up to date
- Add new features to the feature list
- Update installation instructions if needed

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Publish to npm (maintainers only)

## Questions and Support

- **Documentation**: Check the README and docs first
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Chat**: Join our community chat (if available)

## Recognition

Contributors will be recognized in:
- The repository's contributor list
- Release notes for significant contributions
- The project's acknowledgments section

Thank you for contributing to Social Media CLI! 🚀
