
# CI/CD Pipeline Documentation

This pipeline automatically tests and deploys the Lume application.

## Workflow Steps

1. On push to main or pull request:
   - Runs TypeScript type checking
   - Executes tests
   - If on main branch, triggers deployment

## Required Secrets

Set these in your GitHub repository settings:
- `REPL_ID`: Your Replit project ID
- `REPLIT_TOKEN`: Your Replit authentication token
