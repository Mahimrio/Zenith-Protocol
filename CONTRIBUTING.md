# Contributing to GameHub

Thank you for investing your time in contributing to our platform!

## Branching Strategy
Create your branches from `main`. Use descriptive names based on the work type:
- `feature/<feature-name>`
- `fix/<bug-name>`
- `chore/<chore-name>`

## Conventional Commits
We strictly adhere to the Conventional Commits specification. This allows us to auto-generate changelogs.

Format: `<type>(<scope>): <subject>`

**Types**:
- `feat`: A new feature
- `fix`: A bug fix
- `chore`: Maintenance (deps, config changes)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests

Example: `feat(dojo): implement new wave spawn patterns`

## PR Process
1. Fork the repo and clone it locally.
2. Create your branch.
3. Commit your changes using Conventional Commits.
4. Push to your fork and submit a PR against `main`.
5. Ensure all CI checks pass.
