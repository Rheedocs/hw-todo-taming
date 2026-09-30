# Agent Instructions: To Do Taming

This is a group assignment (Node.js, Express and fetch). The goal is not only working code, but also using an AI agent systematically: Understand, plan, let the agent work, review the changes, test, accept or fix.

The agent implements small, clearly scoped parts only. Never build the whole system in one go. No code is accepted unless the whole group can explain it.

## The assignment

A fullstack task app, the "Taskmaster". An Express backend stores tasks in a JSON file (no database). A frontend in plain HTML and JavaScript uses `fetch` to list tasks, add a task and delete a task.

## Build and run

```bash
npm install
npm start
npm test
```

The server runs on port 3000. Open `http://localhost:3000` in the browser. (Update if the structure changes.)

## Architecture

Backend: CommonJS only (`require`, `module.exports`). Never ES modules.

Folders and files:

1. `src/server.js`: creates the real repository with `path.join(__dirname, '..', 'data', 'tasks.json')`, builds the app with `createApp` and calls `listen`. Nothing else.
2. `src/app.js`: `createApp({ taskRepository })` builds the Express app in this order: `express.json()`, `express.static` for `public/`, the routes under `/api/tasks`, `notFound`, `errorHandler`. The path to `public/` is built with `path.join(__dirname, '..', 'public')`.
3. `src/routes/taskRoutes.js`: `createTaskRoutes(taskController)` connects URL and method to a controller function. No logic.
4. `src/controllers/taskController.js`: the only backend layer that knows `req` and `res`. Validates input, picks the status code and catches errors with try/catch. Functions: `handleGetTasks`, `handleAddTask` and `handleDeleteTask`.
5. `src/services/taskService.js`: business logic. Knows nothing about Express. Functions: `getAllTasks()`, `addTask(text)` and `deleteTask(id)`. Makes the id with `crypto.randomUUID()`.
6. `src/repositories/taskRepository.js`: the only place that uses `fs-extra` (`readJson` and `writeJson`). Functions: `readTasks()` and `writeTasks(tasks)`.
7. `src/middleware/notFound.js` and `src/middleware/errorHandler.js`.
8. `public/index.html`, `public/main.js` and `public/style.css`: the frontend.
9. `data/tasks.json`: the task list. Starts as `[]`. Never edited by hand while the server runs.
10. `tests/`: tests, see below.
11. `src/contracts.js`: JSDoc types for `Task`, `TaskRepository`, `TaskService` and `AppDependencies`. Types only, no code. Fakes in tests must match these types.

Dependencies only point one way: routes, controller, service, repository. A layer never knows the layers above it.

Dependency injection: layers get their dependencies as parameters through factory functions and never create them themselves: `createTaskRepository(filePath)`, `createTaskService(taskRepository)`, `createTaskController(taskService)`, `createTaskRoutes(taskController)`. Wiring happens only in `server.js` and `app.js`.

File paths are built with `path.join(__dirname, ...)`, never relative to the folder the server was started from.

## API

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/api/tasks` | 200 and a list `[ { "id", "text", "done" } ]` | 500 if the file cannot be read |
| POST | `/api/tasks` | 201 and the new task | 400 if `text` is missing, not a string or empty, 500 if the file cannot be written |
| DELETE | `/api/tasks/:id` | 204 with no body | 404 if the id does not exist, 500 if the file cannot be written |
| any other | any other | | 404 `{ "error": "..." }` |

Request body for POST: `{ "text": "Ny opgave" }`. A new task is `{ "id": "<uuid>", "text": "Ny opgave", "done": false }`. Invalid JSON gives 400. Errors are JSON `{ "error": "..." }` with a Danish, understandable text, never a stack trace. (Update if the group decides otherwise.)

A 204 response has no body, so the frontend must not call `response.json()` on DELETE.

## Frontend

Plain HTML and JavaScript in the browser. No frameworks, no modules, no build step. No CSS framework unless the group agrees.

1. All three calls use `fetch` with the relative path `/api/tasks`.
2. After add or delete, call `loadTasks()` so the list is always drawn from the server.
3. Build the list with `createElement` and `textContent`. Never put task text into `innerHTML` (XSS).
4. Clicking a task (or its delete button) deletes it.
5. Check `response.ok`. Show a visible error message on failure and use `console.log` while debugging.
6. Functions: `loadTasks`, `renderTasks`, `addTask` and `deleteTask`.

## Error handling

1. async/await with try/catch in the controller. Never callbacks.
2. Errors from the repository are thrown up to the controller. The controller answers 500 with an understandable Danish message.
3. Invalid input gives 400. Unknown id gives 404. Unknown route gives 404.
4. `errorHandler` is the last safety net, e.g. invalid JSON in the body gives 400.
5. The server must never crash because of a bad request or a missing file. No unhandled promise rejections.

## Express 5

1. `req.body` can be `undefined` when no body was sent. Use `req.body?.text`.
2. Old wildcard routes like `app.get('*')` do not work. Use `app.use(notFound)` as the last middleware.
3. `app.use(express.json())` comes before the routes.

## Code style

1. Identifiers in English. Comments and commit messages in Danish. User facing texts in Danish.
2. Simple, readable code over clever solutions. The code must be explainable by everyone in the group.
3. Small functions with one responsibility. KISS, no unnecessary complexity. Structure and architecture are followed, but never at the cost of KISS: if a rule makes the code harder to explain, stop and ask the group.
4. Public functions use JSDoc comments (`/** ... */`) and refer to the types in `src/contracts.js`, e.g. `@param {import('../contracts').TaskRepository} taskRepository`.
5. async/await, never callbacks. `fs-extra` is the only extra package. No others without asking. Use the built in `fetch` in tests.
6. Commit style: short, lowercase, conventional commits with the prefix in English and the text in Danish, e.g. `feat: tilføj slet opgave`.

## Tests

Follow `docs/unit-test-guide.md` (AAA, naming `method_scenario_expectedResult`, one thing per test).

Manual tests as a minimum:

| Test | Expected result |
|---|---|
| `GET /api/tasks` with an empty file | 200 and `[]` |
| `POST /api/tasks` with `text` | 201, the task is in the list and in `data/tasks.json` |
| `POST /api/tasks` without `text` or with an empty text | 400 and understandable error |
| `DELETE /api/tasks/:id` with an existing id | 204, the task is gone |
| `DELETE /api/tasks/:id` with an unknown id | 404 |
| Unknown route | 404 |
| Restart the server | The tasks are still there |
| Frontend: add a task | It appears in the list |
| Frontend: click a task | It is deleted |

Quick test without the frontend, in PowerShell (use `curl.exe`, because `curl` is an alias for something else there):

```bash
curl.exe http://localhost:3000/api/tasks
curl.exe -X POST -H "Content-Type: application/json" -d "{\"text\":\"Ny opgave\"}" http://localhost:3000/api/tasks
curl.exe -X DELETE http://localhost:3000/api/tasks/ID-HER
```

## Git rules

1. Work only on the branch for the current issue (e.g. `2/task_chain`).
2. Only edit files listed in the issue. Ask before touching others.
3. Only `server.js` and `app.js` wire things together. Do not edit them outside the issue that owns them.
4. Before starting and before a PR: merge `main` into the current branch.
5. On merge conflicts: stop and show both sides. Never accept theirs or ours blindly.
6. If the branch, files or build look wrong: stop and report. Do not repair something you do not understand.
7. Never commit `node_modules/` or `.idea/`.
8. If a file from another issue is missing, use a small fake with the same functions. Never create the real one yourself.
9. Never change `src/contracts.js` without a separate issue.

## Working with the agent

Every task given to the agent follows this structure:

```
Opgave: What should be changed?
Kontekst: Which files are relevant?
Krav: What must the solution do?
Må ikke ændres: What must the agent stay away from?
Test: How do we know it works?
```

Before a bigger change: first explain the control flow from request to response, find possible problems with async and error handling, and make a short plan. Wait for our OK. Implement only the agreed change.

Order of work:

1. `server.js` and `app.js`: Express starts, serves `public/`, 404 works
2. `GET /api/tasks`: repository, service, controller and route
3. `POST /api/tasks`: validation (400) and writing
4. `DELETE /api/tasks/:id`: 204 and 404
5. Frontend: list, add and delete
6. `errorHandler` and the error cases
7. Tests in `tests/`

The bonus tasks (done status, created date, dark theme, sorting) are separate issues, made only after the core is merged and tested.

After every change: show which files and lines were changed, explain the change briefly, say which tests we should run and say if anything was changed that we did not ask for.

## Not the agent's job

The answers to the reflection questions in the README must be in our own words: what happens on a crash, what a database would change, what happens when two users add at the same time, and how to add status, editing and deadlines. The agent may explain code when we ask, but does not write these texts.

## Review mode

When asked for a review, the agent may point out problems in: async/await and error handling, unhandled errors, status codes, read, change and write on the file (two requests at the same time can overwrite each other, and a crash during a write can damage the file), XSS in the frontend, layer responsibilities and unnecessary complexity.

In review mode the agent must not change any code. Suggestions only.