const assert = require('node:assert/strict');
const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createTaskRepository } = require('../src/repositories/taskRepository');

async function createTemporaryDirectory(t) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'todo-repository-'));
    t.after(() => fs.remove(directory));
    return directory;
}

test('writeTasks_thenReadTasks_returnsSameTasks', async (t) => {
    // Arrange
    const directory = await createTemporaryDirectory(t);
    const repository = createTaskRepository(path.join(directory, 'tasks.json'));
    const tasks = [{ id: 'a', text: 'Test', done: false }];

    // Act
    await repository.writeTasks(tasks);
    const result = await repository.readTasks();

    // Assert
    assert.deepEqual(result, tasks);
});

test('readTasks_fileMissing_throws', async (t) => {
    // Arrange
    const directory = await createTemporaryDirectory(t);
    const repository = createTaskRepository(path.join(directory, 'missing.json'));

    // Act and Assert
    await assert.rejects(() => repository.readTasks());
});

test('writeTasks_pathIsDirectory_throws', async (t) => {
    // Arrange
    const directory = await createTemporaryDirectory(t);
    const repository = createTaskRepository(directory);
    const tasks = [{ id: 'a', text: 'Test', done: false }];

    // Act and Assert
    await assert.rejects(() => repository.writeTasks(tasks));
});
