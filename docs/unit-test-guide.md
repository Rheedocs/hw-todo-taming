# Unit Test Guide

Tests use Node's built in test runner and assert module. No extra packages.

```bash
npm test
```

`npm test` runs `node --test`, which finds all files named `*.test.js` in `tests/`.

## Naming
`method_scenario_expectedResult`

Example: `deleteTask_unknownId_returnsFalse`

## AAA: Arrange, Act, Assert
Every test follows this structure.

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createTaskService } = require('../src/services/taskService');

test('addTask_validText_returnsTaskWithDoneFalse', async () => {
    // Arrange
    const service = createTaskService(createFakeRepository());

    // Act
    const task = await service.addTask('Skriv tests');

    // Assert
    assert.equal(task.text, 'Skriv tests');
    assert.equal(task.done, false);
});
```

## TDD: Test Driven Development
Write the test before the code.

1. Write a failing test (red)
2. Write the smallest code that makes it pass (green)
3. Refactor without breaking the test (refactor). Clean names, small functions, no duplication. Run `npm run check` afterwards.

## Fakes
Used when the code depends on the file system or another team member's part. Replace the dependency with a small fake that has the same functions as the matching type in `src/contracts.js`.

```js
function createFakeRepository(initialTasks = []) {
    let tasks = [...initialTasks];
    return {
        readTasks: async () => [...tasks],
        writeTasks: async (newTasks) => { tasks = newTasks; },
    };
}
```

```js
test('deleteTask_unknownId_returnsFalse', async () => {
    // Arrange
    const service = createTaskService(createFakeRepository());

    // Act
    const result = await service.deleteTask('findes-ikke');

    // Assert
    assert.equal(result, false);
});
```

```js
test('deleteTask_existingId_removesTask', async () => {
    // Arrange
    const repository = createFakeRepository([{ id: 'a', text: 'Test', done: false }]);
    const service = createTaskService(repository);

    // Act
    await service.deleteTask('a');

    // Assert
    assert.deepEqual(await repository.readTasks(), []);
});
```

## Through HTTP (the whole app with a fake repository)
`createApp` receives its dependencies, so the app can be started on a random port with a fake repository and called with the built in `fetch`.

```js
const { createApp } = require('../src/app');

test('postTasks_missingText_returns400', async (t) => {
    // Arrange
    const app = createApp({ taskRepository: createFakeRepository() });
    const server = app.listen(0);
    t.after(() => server.close());
    const { port } = server.address();

    // Act
    const response = await fetch(`http://localhost:${port}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });

    // Assert
    assert.equal(response.status, 400);
});
```

## The repository (the only real file in tests)
The repository is the only place where a real file is allowed, and only a temporary file, never `data/tasks.json`.

```js
const os = require('node:os');
const path = require('node:path');
const fs = require('fs-extra');
const { createTaskRepository } = require('../src/repositories/taskRepository');

test('writeTasks_thenReadTasks_returnsSameTasks', async (t) => {
    // Arrange
    const filePath = path.join(os.tmpdir(), 'todo-test-tasks.json');
    t.after(() => fs.remove(filePath));
    const repository = createTaskRepository(filePath);
    const tasks = [{ id: 'a', text: 'Test', done: false }];

    // Act
    await repository.writeTasks(tasks);
    const result = await repository.readTasks();

    // Assert
    assert.deepEqual(result, tasks);
});
```

```js
test('readTasks_fileMissing_throws', async () => {
    // Arrange
    const repository = createTaskRepository(path.join(os.tmpdir(), 'findes-ikke.json'));

    // Act and Assert
    await assert.rejects(() => repository.readTasks());
});
```

## Rules of thumb

1. One behaviour per test. If it fails, you should know exactly what went wrong.
2. Test the limits. `text` missing, `text` is a number, empty text, only spaces, broken JSON.
3. Test error cases. File missing, write fails, unknown id (404), unknown route (404).
4. Fake the dependencies. Anything using the file system is replaced in tests, except the repository test above.
5. No logic in tests. No if, no loops. Tests should be dumb and direct.
6. Test behaviour, not implementation. Test what the code does, not how.
7. Tests never read or write `data/tasks.json`.
8. The frontend is tested by hand, see the manual test table in `AGENTS.md`.