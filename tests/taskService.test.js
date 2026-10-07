const assert = require('node:assert/strict');
const test = require('node:test');
const { createTaskService } = require('../src/services/taskService');

function createFakeRepository(initialTasks = []) {
    let tasks = [...initialTasks];
    return {
        readTasks: async () => [...tasks],
        writeTasks: async (newTasks) => {
            tasks = [...newTasks];
        },
    };
}

test('getAllTasks_repositoryHasTasks_returnsTasks', async () => {
    // Arrange
    const tasks = [{ id: 'a', text: 'Test', done: false }];
    const service = createTaskService(createFakeRepository(tasks));

    // Act
    const result = await service.getAllTasks();

    // Assert
    assert.deepEqual(result, tasks);
});

test('addTask_validText_returnsAndStoresNewTask', async () => {
    // Arrange
    const repository = createFakeRepository();
    const service = createTaskService(repository);

    // Act
    const task = await service.addTask('Skriv tests');

    // Assert
    assert.match(task.id, /^[0-9a-f-]{36}$/);
    assert.deepEqual(task, { id: task.id, text: 'Skriv tests', done: false });
    assert.deepEqual(await repository.readTasks(), [task]);
});

test('deleteTask_existingId_removesTaskAndReturnsTrue', async () => {
    // Arrange
    const repository = createFakeRepository([{ id: 'a', text: 'Test', done: false }]);
    const service = createTaskService(repository);

    // Act
    const result = await service.deleteTask('a');

    // Assert
    assert.equal(result, true);
    assert.deepEqual(await repository.readTasks(), []);
});

test('deleteTask_unknownId_returnsFalse', async () => {
    // Arrange
    const service = createTaskService(createFakeRepository());

    // Act
    const result = await service.deleteTask('unknown');

    // Assert
    assert.equal(result, false);
});
