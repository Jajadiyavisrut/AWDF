# Practical 12: CI/CD Pipeline with GitHub Actions

## Repository and branch

- Repository: `Jajadiyavisrut/AWDF`
- Branch: `p12`
- Workflow: `.github/workflows/ci.yml`

## CI pipeline

The `CI Pipeline` workflow runs on pushes to `p12` and `main`, and on pull requests targeting `main`. It runs on `ubuntu-latest`, checks out the repository with `actions/checkout@v4`, installs Node.js 20 with `actions/setup-node@v4`, installs backend dependencies with `npm install`, and runs `npm test` in `task-manager-api`.

The npm cache uses `task-manager-api/package-lock.json` as its dependency key.

## Automated test

`task-manager-api/test/ci.test.js` uses Supertest to call the existing `GET /debug/cache` endpoint and verifies the actual HTTP status and response properties. The test does not require a development MongoDB instance. During test mode, the application skips its production MongoDB connection, and the logger only writes database records when a connection is ready.

## Local result

Command:

```text
cd task-manager-api
npm test
```

Actual result: Jest completed successfully with 1 test suite passed and 1 test passed.

## Failed pipeline evidence

No GitHub Actions failed-run screenshot or remote failed run was obtained in this environment. No fabricated screenshot, run ID, or checkmark is included.

To create this evidence manually, temporarily change the expected status in `test/ci.test.js`, commit and push that separate change to `p12`, then save the failed Actions run screenshot. Restore the expectation before the final passing commit.

## Passing pipeline evidence

The local test passed as described above. The workflow file is committed and pushed to `origin/p12`, but a GitHub-hosted successful run and screenshot were not available for verification in this environment.

## Root cause and correction

The initial CI test discovery included database integration tests that depend on MongoDB. The required CI smoke test was isolated to the existing `/debug/cache` endpoint. Test mode now avoids opening the production MongoDB connection, and the logger avoids attempting database persistence before Mongoose is connected. Production startup and normal connected logging behavior remain unchanged.

## Commands used

```text
git status --short --branch
git add .github/workflows/ci.yml README.md task-manager-api/package.json task-manager-api/package-lock.json task-manager-api/test/ci.test.js
git commit -m "Add Practical 12 GitHub Actions CI pipeline"
git push origin p12
cd task-manager-api && npm test
```

No credentials, `.env` files, `node_modules`, or generated screenshots are included.

## CI versus CD

Continuous Integration automatically builds and tests changes so defects are found early. Continuous Delivery or Deployment extends that process by packaging and releasing validated changes to a staging or production environment. This practical implements CI; it does not deploy the application.
