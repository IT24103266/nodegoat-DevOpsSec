# Secrets Management

## Principle

No credentials, API keys, or connection strings are hardcoded or committed to this repository. All secrets are injected at runtime.

## Pipeline Secrets

Stored in GitHub Actions encrypted secrets (Repository → Settings → Secrets and variables → Actions) and referenced in workflows as `${{ secrets.SECRET_NAME }}`.

| Secret | Used by | Purpose |
|--------|---------|---------|
| `MONGODB_URI` | Application runtime | MongoDB connection string |
| `GITHUB_TOKEN` | Actions workflow | Auto-provided by GitHub |

## Application Runtime Secrets

Injected via environment variables declared in `docker-compose.yml`. Local development uses a `.env` file excluded from Git via `.gitignore`.

## Container Image

`.dockerignore` excludes `*.key`, `*.pem`, and `.env` from the image build context. Trivy scans every built image for embedded secrets and fails the pipeline on detection.

## Detection and Response

- **Gitleaks** runs on every push and fails the pipeline on any detected secret.
- **GitHub Push Protection** (native) blocks pushes containing secrets before they reach the repository.
- On accidental commit: rotate the credential immediately, then purge from history using `git filter-repo` or BFG Repo-Cleaner.