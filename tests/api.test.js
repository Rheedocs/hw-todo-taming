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
    const baseUrl = startTestServer(t, [], taskRepository);

    // Act
    const response = await fetch(`${baseUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Skriv tests' }),
    });

    // Assert
    assert.equal(response.status, 500);
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
