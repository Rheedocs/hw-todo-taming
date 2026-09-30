# Unit Test Guide

Tests use Node's built in test runner and assert module. No extra packages.

```bash
npm test
```

`npm test` runs `node --test`, which finds all files named `*.test.js` in `tests/`.

## Naming
`method_scenario_expectedResult`

Example: `readContent_repositoryFails_throws`

## AAA: Arrange, Act, Assert
Every test follows this structure.

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { createFileService } = require('../src/services/fileService');

test('readContent_repositoryReturnsText_returnsText', async () => {
    // Arrange
    const fakeRepository = { readFile: async () => 'Hej fra filen' };
    const service = createFileService(fakeRepository);

    // Act
    const result = await service.readContent();

    // Assert
    assert.equal(result, 'Hej fra filen');
});
```

## TDD: Test Driven Development
Write the test before the code.

1. Write a failing test (red)
2. Write the smallest code that makes it pass (green)
3. Refactor without breaking the test (refactor)

## Without fakes (pure logic)
Used when the code has no external dependencies. The request logger and the emitter belong here.

```js
const { EventEmitter } = require('node:events');
const { attachRequestLogger } = require('../src/events/requestLogger');

test('attachRequestLogger_requestEmitted_writesMethodAndPath', () => {
    // Arrange
    const emitter = new EventEmitter();
    const lines = [];
    attachRequestLogger(emitter, (line) => lines.push(line));

    // Act
    emitter.emit('request', { method: 'GET', path: '/read-file' });

    // Assert
    assert.deepEqual(lines, ['GET /read-file']);
});
```

## With fakes (external dependency)
Used when the code depends on the file system or another team member's part. Replace the dependency with a small fake that has the same functions as the matching type in `src/contracts.js`.

```js
const fakeRepository = {
    readFile: async () => { throw new Error('boom'); },
    writeFile: async () => {},
};
```

```js
test('readContent_repositoryFails_throws', async () => {
    // Arrange
    const service = createFileService(fakeRepository);

    // Act and Assert
    await assert.rejects(() => service.readContent());
});
```

## Through HTTP (the whole app with a fake repository)
`createApp` receives its dependencies, so the app can be started on a random port with a fake repository and called with the built in `fetch`.

```js
const { createApp } = require('../src/app');

test('getReadFile_repositoryFails_returns500', async (t) => {
    // Arrange
    const fakeRepository = {
        readFile: async () => { throw new Error('boom'); },
        writeFile: async () => {},
    };
    const app = createApp({ fileRepository: fakeRepository, emitter: new EventEmitter() });
    const server = app.listen(0);
    t.after(() => server.close());
    const { port } = server.address();

    // Act
    const response = await fetch(`http://localhost:${port}/read-file`);

    // Assert
    assert.equal(response.status, 500);
});
```

## The repository (the only real file in tests)
The repository is the only place where a real file is allowed, and only a temporary file, never `data/data.txt`.

```js
const os = require('node:os');
const path = require('node:path');
const { createFileRepository } = require('../src/repositories/fileRepository');

test('readFile_fileMissing_throws', async () => {
    // Arrange
    const repository = createFileRepository(path.join(os.tmpdir(), 'findes-ikke.txt'));

    // Act and Assert
    await assert.rejects(() => repository.readFile());
});
```

This tests the error scenario from the assignment without renaming any file.

## Rules of thumb

1. One thing per test. If it fails, you should know exactly what went wrong.
2. Test the limits. `content` missing, `content` is a number, empty body, broken JSON, empty string.
3. Test error cases. File missing, write fails, unknown route (404).
4. Fake the dependencies. Anything using the file system is replaced in tests, except the repository test above.
5. No logic in tests. No if, no loops. Tests should be dumb and direct.
6. Test behaviour, not implementation. Test what the code does, not how.
7. Tests never read or write `data/data.txt`.