# Practical 13: AI Task Description Generation

## Objective

Add a secure AI-assisted task description suggestion to the existing AWDF React and Express task manager without exposing the OpenAI credential or changing the existing task CRUD workflow.

## Architecture

The React task form sends only the entered task title to the existing Express backend. The backend exposes `POST /api/ai/generate-description`, authenticates the request with the existing JWT middleware, calls the official OpenAI SDK server-side, and returns `{ description }`. The generated text is placed into an editable description textarea and is not saved until the user submits the normal task form.

The OpenAI API key is read from `task-manager-api/.env` by `dotenv`. Docker Compose passes it to the backend through runtime environment interpolation. It is not placed in the frontend bundle, Dockerfile, source code, response body, or logs. `.env.example` contains only a placeholder value for the OpenAI key alongside the existing non-secret application configuration.

## Implementation

- Added `Generate description` to the existing task creation form.
- Added an editable description field and the disclaimer: `AI-generated suggestion — review and edit before saving.`
- Added loading prevention with `Generating...` and disabled button state.
- Added friendly error handling so manual task creation remains available if AI generation fails.
- Added bounded title validation and a per-user/title one-minute request limit.
- Added safe fallback responses for missing credentials, invalid credentials, quota errors, timeouts, and provider failures.
- Preserved the existing authenticated task endpoints and Docker non-root configuration.

## Tests

Command:

```text
cd task-manager-api
npm test
```

Actual result: 2 test suites passed and 5 tests passed.

The mocked tests cover successful generation, empty-title validation, missing-key fallback, provider failure fallback, and the existing `/debug/cache` endpoint. No live OpenAI request was made, so live API access was not verified and no API charges were incurred.

Frontend validation:

```text
npm run build
```

Actual result: Vite production build completed successfully.

## Responsible AI and privacy

Only the task title is sent to OpenAI. Passwords, JWTs, personal records, and other task-manager data are not sent to the provider. The generated content is presented as a suggestion and remains editable. Users decide whether to keep it before saving.

## Evidence

The implementation and test results above are genuine. No frontend or fallback screenshots were captured in this environment, so no fabricated screenshots are included. Screenshots can be added after starting the application locally and capturing the task form and unavailable-service state.

## Conclusion

Practical 13 adds a server-side, authenticated, rate-limited AI suggestion flow while preserving manual task creation, existing authentication, Docker deployment, and safe secret handling.
