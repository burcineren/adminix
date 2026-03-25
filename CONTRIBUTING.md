# Contributing to AutoAdmin

Thank you for your interest in contributing! Here's how to get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/burcineren/auto-admin.git
cd auto-admin

# Install dependencies
npm install

# Start the dev server
npm run dev

# Build the library
npm run build:lib

# Type-check
npx tsc --noEmit
```

## Project Structure

| Directory | Purpose |
|---|---|
| `src/components/` | UI components (AdminPanel, DataTable, etc.) |
| `src/core/schema/` | Schema inference, parsing, mapping, and plugins |
| `src/hooks/` | React hooks (useResource, useCrudActions) |
| `src/plugins/` | Example plugins |
| `src/ui/` | Primitive UI components (Button, Modal, Select) |
| `src/utils/` | Utilities (code-generator, zip-exporter) |
| `src/demo/` | Demo application |

## Pull Request Guidelines

1. **Fork** the repository and create your branch from `main`.
2. Run `npx tsc --noEmit` to ensure type safety.
3. Keep PRs focused — one feature or fix per PR.
4. Write clear commit messages.
5. Update documentation if your changes affect the public API.

## Code Style

- Use TypeScript strict mode.
- Prefer named exports over default exports.
- Use `cn()` utility for conditional class names.
- Follow the existing component patterns (props interface → component → export).

## Adding a Plugin

1. Create a new file in `src/plugins/`.
2. Export a factory function that returns an `AdminPlugin` object.
3. Add an example usage in `src/demo/examples.tsx`.

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests.
- Include reproduction steps for bugs.
- Label issues appropriately.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
