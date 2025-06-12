# .github Directory Structure

## Issue Templates
- `ISSUE_TEMPLATE/bug_report.yml` - Structured bug report form
- `ISSUE_TEMPLATE/feature_request.yml` - Feature request template

## Workflows  
- `workflows/ci.yml` - Continuous Integration pipeline
- `workflows/release.yml` - Automated release workflow

## Pull Request Template
- `pull_request_template.md` - PR review checklist

## Additional GitHub Features

### Dependabot Configuration
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    reviewers:
      - "YOUR_USERNAME"
    assignees:
      - "YOUR_USERNAME"
    commit-message:
      prefix: "chore"
      include: "scope"
```

### Code Owners
Create `.github/CODEOWNERS`:

```
# Global owners
* @YOUR_USERNAME

# Platform-specific code
/src/platforms/ @YOUR_USERNAME

# Configuration files
*.json @YOUR_USERNAME
*.yml @YOUR_USERNAME
*.yaml @YOUR_USERNAME

# Documentation
*.md @YOUR_USERNAME
```

### Funding Configuration  
Create `.github/FUNDING.yml` (optional):

```yaml
# These are supported funding model platforms
github: [YOUR_USERNAME]
patreon: YOUR_USERNAME
open_collective: YOUR_PROJECT
ko_fi: YOUR_USERNAME
tidelift: "npm/social-media-cli"
community_bridge: # Replace with a single Community Bridge project-name
liberapay: YOUR_USERNAME
issuehunt: YOUR_USERNAME
otechie: YOUR_USERNAME
custom: ["https://paypal.me/YOUR_USERNAME", "https://www.buymeacoffee.com/YOUR_USERNAME"]
```

---

All GitHub-specific configurations are now ready for a professional open-source project!
