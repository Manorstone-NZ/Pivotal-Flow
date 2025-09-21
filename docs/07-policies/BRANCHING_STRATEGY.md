# Pivotal Flow Branching Strategy

## Overview

This document outlines the branching strategy and best practices for the Pivotal Flow project. It defines branch types, naming conventions, workflows, and maintenance procedures to ensure consistent and efficient development practices.

## Core Branch Types

### 1. Main/Production Branch

**Branch Name:** `main`

**Purpose:** 
- Stable, deployable production code
- Source of truth for production releases
- Protected from direct commits

**Protection Rules:**
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date before merging
- Restrict pushes to this branch

**Merges:** Only from release branches or critical hotfixes

### 2. Feature Branches

**Naming Convention:** `feat/description` or `feature/description`

**Purpose:**
- New features and enhancements
- Non-critical bug fixes
- Experimental features

**Examples:**
```bash
feat/authentication-system
feat/quote-management
feat/invoice-generation
feat/user-management
feat/payment-integration
```

**Lifecycle:**
1. Created from `main` branch
2. Developed and tested
3. Pull request to `main`
4. Merged and deleted

### 3. Bug Fix Branches

**Naming Convention:** `fix/description` or `bugfix/description`

**Purpose:**
- Bug fixes and corrections
- Non-critical issues

**Examples:**
```bash
fix/login-validation
fix/pdf-download-error
fix/quote-calculation-bug
fix/authentication-timeout
```

**Hotfix Branches:**
**Naming Convention:** `hotfix/description`

**Purpose:**
- Critical production issues
- Security patches
- Can bypass normal review process for urgent fixes

**Examples:**
```bash
hotfix/security-vulnerability
hotfix/critical-data-loss
hotfix/production-outage
```

### 4. Release Branches

**Naming Convention:** `release/version`

**Purpose:**
- Prepare releases
- Version bumps
- Final testing before production

**Examples:**
```bash
release/v1.2.0
release/v2.0.0-beta
release/v1.1.5-patch
```

### 5. Infrastructure Branches

**Naming Convention:** `infra/description`

**Purpose:**
- Infrastructure changes
- CI/CD improvements
- Database migrations
- Deployment configurations

**Examples:**
```bash
infra/docker-optimization
infra/database-migration
infra/ci-pipeline-update
infra/security-hardening
```

### 6. Documentation Branches

**Naming Convention:** `docs/description`

**Purpose:**
- Documentation updates
- User manual changes
- API documentation

**Examples:**
```bash
docs/api-documentation
docs/user-manual-update
docs/installation-guide
```

### 7. Refactoring Branches

**Naming Convention:** `refactor/description`

**Purpose:**
- Code improvements
- Architecture changes
- Performance optimizations

**Examples:**
```bash
refactor/auth-service
refactor/database-schema
refactor/frontend-components
```

### 8. Configuration Branches

**Naming Convention:** `config/description`

**Purpose:**
- Environment configuration changes
- Deployment settings
- Feature flags

**Examples:**
```bash
config/environment-variables
config/deployment-settings
config/feature-flags
```

## Specialized Branch Types

### 9. Template/Foundation Branches

**Naming Convention:** `template/description`

**Purpose:**
- Reusable starting points
- Project templates
- Boilerplate code

**Examples:**
```bash
App_Platform_Foundations    # Current template branch
template/microservice-base
template/frontend-starter
```

### 10. Experimental Branches

**Naming Convention:** `experiment/description` or `spike/description`

**Purpose:**
- Research and development
- Proof of concepts
- Investigation branches

**Examples:**
```bash
experiment/new-auth-system
experiment/performance-optimization
spike/investigation-name
```

### 11. Personal/Developer Branches

**Naming Convention:** `developer/description` or `username/description`

**Purpose:**
- Personal development space
- Work-in-progress branches
- Temporary branches

**Examples:**
```bash
damian/feature-name
developer/working-branch
temp/quick-fix
```

## Branch Workflow Strategies

### Recommended Workflow for Pivotal Flow

```
main ← develop ← feature/name
     ← release/v1.0 ← hotfix/critical
```

#### Primary Branches:
- `main` - Production-ready code
- `develop` - Integration branch (consider adding)

#### Feature Development:
1. Create feature branch from `main`
2. Develop and test locally
3. Create pull request to `main`
4. Code review and approval
5. Merge and delete feature branch

#### Hotfix Process:
1. Create hotfix branch from `main`
2. Implement fix and test
3. Create pull request to `main`
4. Expedited review process
5. Merge to `main` and deploy

## Branch Management Commands

### Creating Branches

```bash
# Create and switch to new branch from current branch
git checkout -b feat/new-feature

# Create branch from specific branch
git checkout -b fix/bug main

# Create branch from remote branch
git checkout -b local-branch origin/remote-branch

# Create branch without switching to it
git branch feat/new-feature
```

### Branch Operations

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List remote branches only
git branch -r

# Switch to branch
git checkout branch-name
git switch branch-name        # Newer syntax

# Delete local branch (safe)
git branch -d branch-name

# Force delete local branch
git branch -D branch-name

# Push new branch to remote
git push -u origin branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Branch Cleanup

```bash
# Delete merged branches (safe)
git branch --merged | grep -v main | xargs -n 1 git branch -d

# Prune remote tracking branches
git remote prune origin

# List stale remote branches
git for-each-ref --format='%(refname:short) %(committerdate)' refs/remotes | sort -k2

# Delete merged feature branches
git branch --merged main | grep -E "feat/|fix/|docs/" | xargs -n 1 git branch -d
```

## Branch Protection Rules

### Main Branch Protection

Configure the following protection rules for the `main` branch:

1. **Require pull request reviews**
   - Minimum 1 reviewer
   - Dismiss stale reviews when new commits are pushed
   - Require review from code owners

2. **Require status checks to pass before merging**
   - TypeScript compilation
   - ESLint checks
   - Unit tests
   - E2E tests (if applicable)

3. **Require branches to be up to date before merging**
   - Ensures latest changes are included

4. **Restrict pushes to this branch**
   - Only allow pushes via pull requests

### Development Branch Protection (if using)

1. **Require pull request reviews**
   - Minimum 1 reviewer for features
   - Allow self-approval for documentation

2. **Require status checks**
   - Basic compilation and linting
   - Unit tests

## Current Project Branches

### Active Branches

```bash
main                           # Production branch
feat/auth-opaque-paseto        # Current authentication system work
App_Platform_Foundations       # Template/foundation branch
```

### Branch Status

- **main**: Protected production branch
- **feat/auth-opaque-paseto**: Contains consolidated work from epic-FE branches
- **App_Platform_Foundations**: Template branch for new projects

## Branch Naming Guidelines

### Required Elements

1. **Type Prefix**: Must start with one of the approved prefixes
2. **Descriptive Name**: Clear, concise description
3. **Hyphen Separation**: Use hyphens to separate words
4. **Lowercase**: Use lowercase letters only

### Approved Prefixes

- `feat/` - New features
- `fix/` - Bug fixes
- `hotfix/` - Critical fixes
- `release/` - Release preparation
- `infra/` - Infrastructure changes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `config/` - Configuration changes
- `experiment/` - Experimental work
- `spike/` - Investigation work

### Examples of Good Names

```bash
feat/user-authentication
fix/login-validation-error
hotfix/security-vulnerability-patch
release/v1.2.0
infra/docker-compose-optimization
docs/api-endpoint-documentation
refactor/database-connection-pool
config/environment-variable-updates
experiment/new-payment-gateway
spike/performance-optimization-research
```

### Examples of Bad Names

```bash
# Missing prefix
user-auth

# Unclear description
fix-stuff

# Using underscores
feat/user_authentication

# Too vague
feat/improvements

# Mixed case
feat/UserAuthentication
```

## Branch Lifecycle Management

### Feature Branch Lifecycle

1. **Creation**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/new-feature
   ```

2. **Development**
   ```bash
   # Make commits
   git add .
   git commit -m "feat: implement new feature"
   
   # Push to remote
   git push -u origin feat/new-feature
   ```

3. **Pull Request**
   - Create PR from feature branch to main
   - Add reviewers
   - Ensure all checks pass

4. **Merge and Cleanup**
   ```bash
   # After merge, switch to main
   git checkout main
   git pull origin main
   
   # Delete local branch
   git branch -d feat/new-feature
   
   # Delete remote branch (if not auto-deleted)
   git push origin --delete feat/new-feature
   ```

### Hotfix Branch Lifecycle

1. **Creation**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. **Quick Development and Testing**
   ```bash
   git add .
   git commit -m "hotfix: resolve critical issue"
   git push -u origin hotfix/critical-fix
   ```

3. **Expedited Review and Merge**
   - Create urgent PR
   - Expedited review process
   - Merge to main immediately

4. **Cleanup**
   ```bash
   git checkout main
   git pull origin main
   git branch -d hotfix/critical-fix
   git push origin --delete hotfix/critical-fix
   ```

## Best Practices

### Do's

1. **Use descriptive branch names** that clearly indicate the purpose
2. **Keep branches short-lived** - merge and delete promptly
3. **Create branches from the latest main** branch
4. **Use pull requests** for all merges to main
5. **Clean up merged branches** regularly
6. **Protect main branch** with appropriate rules
7. **Use conventional commit messages**
8. **Test branches thoroughly** before merging

### Don'ts

1. **Don't commit directly to main** (except in emergencies)
2. **Don't use long-lived feature branches** without regular updates
3. **Don't merge without proper review** and testing
4. **Don't leave branches undeleted** after merging
5. **Don't use unclear or generic branch names**
6. **Don't create branches from outdated main**
7. **Don't skip CI/CD checks** when merging

## Emergency Procedures

### Critical Production Issues

1. **Create hotfix branch immediately**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Implement minimal fix**
   - Focus only on resolving the critical issue
   - Avoid feature additions

3. **Expedited review and merge**
   - Notify team of critical issue
   - Expedited review process
   - Merge and deploy immediately

4. **Post-incident cleanup**
   - Document the issue and resolution
   - Review process improvements
   - Clean up hotfix branch

## Monitoring and Maintenance

### Regular Tasks

1. **Weekly branch cleanup**
   ```bash
   # Delete merged branches
   git branch --merged main | grep -E "feat/|fix/|docs/" | xargs -n 1 git branch -d
   git remote prune origin
   ```

2. **Monthly branch audit**
   - Review long-lived branches
   - Identify stale branches
   - Clean up abandoned work

3. **Quarterly strategy review**
   - Review branching strategy effectiveness
   - Update policies based on team feedback
   - Adjust protection rules as needed

### Branch Metrics

Track the following metrics:
- Average branch lifetime
- Number of branches per developer
- Merge frequency to main
- Hotfix frequency
- Branch cleanup rate

## Integration with CI/CD

### Automated Checks

1. **Branch Protection**
   - Automatic status checks
   - Required reviews
   - Merge restrictions

2. **Quality Gates**
   - TypeScript compilation
   - ESLint validation
   - Unit test execution
   - E2E test validation

3. **Automated Cleanup**
   - Auto-delete merged branches
   - Notification of stale branches
   - Regular cleanup reminders

## Conclusion

This branching strategy provides a structured approach to managing code development in the Pivotal Flow project. By following these guidelines, the team can maintain code quality, facilitate collaboration, and ensure smooth deployment processes.

Regular review and updates of this strategy ensure it remains effective as the project evolves.

---

**Last Updated:** $(date)
**Version:** 1.0
**Next Review:** Quarterly
