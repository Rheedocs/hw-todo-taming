const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');

// Fake repository for API tests.
function createFakeRepository(initialTasks = []) {
    let tasks = [...initialTasks];
    return {
        readTasks: async () => [...tasks],
        writeTasks: async (newTasks) => {
            tasks = newTasks;
        },
    };
}

// Slow fake repository: every read and write takes a few ms, so requests overlap.
function createSlowFakeRepository() {
    const repository = createFakeRepository();
    const wait = () => new Promise((resolve) => setTimeout(resolve, 5));
    return {
        readTasks: async () => {
            await wait();
            return repository.readTasks();
        },
        writeTasks: async (tasks) => {
            await wait();
            return repository.writeTasks(tasks);
        },
    };
}

function startTestServer(t, initialTasks = [], taskRepository = createFakeRepository(initialTasks)) {
    const app = createApp({ taskRepository });
    const server = app.listen(0);
    t.after(() => server.close());
    return `http://localhost:${server.address().port}`;
}

test('getTasks_existingTasks_returns200AndList', async (t) => {
    // Arrange
    const task = { id: 'task-1', text: 'Læs', done: false };
    const baseUrl = startTestServer(t, [task]);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`);
    const tasks = await response.json();

    // Assert
    assert.equal(response.status, 200);
    assert.deepEqual(tasks, [task]);
});

test('postTasks_withText_returns201AndNewTask', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Skriv tests' }),
    });
    const task = await response.json();

    // Assert
    assert.equal(response.status, 201);
    assert.equal(typeof task.id, 'string');
    assert.equal(task.text, 'Skriv tests');
    assert.equal(task.done, false);
});

test('postTasks_thenGetTasks_returnsNewTask', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const postResponse = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Skriv tests' }),
    });
    const newTask = await postResponse.json();
    const getResponse = await fetch(`${baseUrl}/api/tasks`);
    const tasks = await getResponse.json();

    // Assert
    assert.equal(postResponse.status, 201);
    assert.equal(getResponse.status, 200);
    assert.deepEqual(tasks, [newTask]);
});

test('postTasks_missingText_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
    });

    // Assert
    assert.equal(response.status, 400);
});

test('postTasks_emptyText_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '' }),
    });

    // Assert
    assert.equal(response.status, 400);
});

test('postTasks_onlySpaces_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   ' }),
    });

    // Assert
    assert.equal(response.status, 400);
});

test('postTasks_invalidJson_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ikke json',
    });
    const result = await response.json();

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(result, { error: 'Anmodningen indeholder ugyldig JSON.' });
});

test('postTasks_writeFails_returns500', async (t) => {
    // Arrange
    const taskRepository = createFakeRepository();
    taskRepository.writeTasks = async () => {
        throw new Error('Write failed');
    };
    t.mock.method(console, 'error', () => {});
    const baseUrl = startTestServer(t, [], taskRepository);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Skriv tests' }),
    });

    // Assert
    assert.equal(response.status, 500);
    assert.equal(console.error.mock.callCount(), 1);
});

test('postTasks_textTooLong_returns400', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'a'.repeat(201) }),
    });
    const result = await response.json();

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(result, { error: 'Opgavens tekst må højst være 200 tegn.' });
});

test('deleteTask_existingId_returns204', async (t) => {
    // Arrange
    const task = { id: 'task-1', text: 'Slet mig', done: false };
    const baseUrl = startTestServer(t, [task]);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks/${task.id}`, {
        method: 'DELETE',
    });

    // Assert
    assert.equal(response.status, 204);
});

test('deleteTask_unknownId_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks/unknown-id`, {
        method: 'DELETE',
    });

    // Assert
    assert.equal(response.status, 404);
});

test('getUnknownRoute_unmatchedPath_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/route-that-does-not-exist`);

    // Assert
    assert.equal(response.status, 404);
});

test('postTasks_textWithSurroundingSpaces_returnsTrimmedText', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   Skriv tests   ' }),
    });
    const task = await response.json();

    // Assert
    assert.equal(response.status, 201);
    assert.equal(task.text, 'Skriv tests');
});

test('postTasks_tenConcurrentRequests_savesAllTasks', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t, [], createSlowFakeRepository());
    const postTask = (text) => fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });

    // Act
    const responses = await Promise.all(
        Array.from({ length: 10 }, (_, index) => postTask(`Opgave ${index}`)),
    );
    const getResponse = await fetch(`${baseUrl}/api/tasks`);
    const tasks = await getResponse.json();

    // Assert
    assert.ok(responses.every((response) => response.status === 201));
    assert.equal(tasks.length, 10);
});

test('patchTask_doneTrue_returns200AndUpdatedTask', async (t) => {
    // Arrange
    const task = { id: 'task-1', text: 'Læs', done: false };
    const baseUrl = startTestServer(t, [task]);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: true }),
    });
    const updated = await response.json();
    const tasks = await (await fetch(`${baseUrl}/api/tasks`)).json();

    // Assert
    assert.equal(response.status, 200);
    assert.deepEqual(updated, { id: 'task-1', text: 'Læs', done: true });
    assert.deepEqual(tasks, [updated]);
});

test('patchTask_unknownId_returns404', async (t) => {
    // Arrange
    const baseUrl = startTestServer(t);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks/unknown-id`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: true }),
    });

    // Assert
    assert.equal(response.status, 404);
});

test('patchTask_doneNotBoolean_returns400', async (t) => {
    // Arrange
    const task = { id: 'task-1', text: 'Læs', done: false };
    const baseUrl = startTestServer(t, [task]);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: 'ja' }),
    });
    const result = await response.json();

    // Assert
    assert.equal(response.status, 400);
    assert.deepEqual(result, { error: 'Feltet done skal være sand eller falsk.' });
});