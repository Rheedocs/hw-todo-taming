# Agent instructions: To Do Taming

Small Node.js and Express app with a plain HTML frontend. Work in small steps, one issue at a time. We must be able to explain every line, so keep the code simple.

## Before you say done

1. Run `npm run check`. It must be green.
2. Tell us which files you changed, and if you changed anything we did not ask for.

If lint fails, fix the code. Never use `eslint-disable`. If a lint rule does not fit the task, stop and ask us. Changes to `eslint.config.js` need their own issue.

## Structure

CommonJS only. The server listens on port 3000. Keep the design small and make each layer easy to explain.

1. `server.js` creates the real repository and starts the server. `app.js` has `createApp({ taskRepository })` and registers the API endpoints. These are the only files that wire dependencies together.
2. Middleware order in `createApp`: `express.json()`, `express.static` for `public/`, API endpoints under `/api/tasks`, `notFound`, then `errorHandler`.
3. `app.js` connects URLs to controller handlers. The controller handles requests and responses, validates input, and catches service errors. The service contains task logic (`crypto.randomUUID()` for id, new task is `{ id, text, done: false }`). The repository is the only place that uses `fs-extra` (`readJson`, `writeJson`).
4. Controller handlers and task service functions are defined inside their factory functions. `errorHandler` is an Express error handler with four parameters.
5. Dependencies come in as parameters through `createXxx` functions. Use `path.join(__dirname, ...)` for paths.

## API

1. GET `/api/tasks` gives 200 and a list.
2. POST `/api/tasks` with `{ "text": "..." }` gives 201 and the new task. Missing, empty, whitespace-only, or longer than 200 characters gives 400.
3. DELETE `/api/tasks/:id` gives 204 with no body. Unknown id gives 404.
4. Unknown route gives 404. Invalid JSON gives 400. Other errors give 500.

Errors are `{ "error": "..." }` with fixed Danish text, never `err.message` or a stack trace. Use `req.body?.text` and register `notFound` after all other middleware.

## Frontend

1. Plain JavaScript with `fetch`. POST needs `Content-Type: application/json` and `JSON.stringify({ text })`.
2. Never call `response.json()` on DELETE, it has no body.
3. Use `createElement` and `textContent`, never `innerHTML`.
4. Check `response.ok` and show an error message. Call `loadTasks()` after add and delete.

## Rules

1. Everything is in English: identifiers, comments and commit messages.
2. Text shown to the user (error messages, buttons) stays in Danish.
3. async/await, never callbacks. No new packages without asking.
4. Only edit the files in the issue, on the branch for that issue. Merge `main` in before a PR.
5. If something looks wrong or there is a merge conflict, stop and tell us.
6. Make a short plan first and wait for our OK before you change code.
7. The README reflection answers are ours. Do not write them.