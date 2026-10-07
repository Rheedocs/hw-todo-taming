const { randomUUID } = require('node:crypto');

/**
 * Creates task business logic using an injected repository.
 * @param {import('../contracts').TaskRepository} taskRepository
 * @returns {import('../contracts').TaskService}
 */
function createTaskService(taskRepository) {
    return {
        getAllTasks: () => taskRepository.readTasks(),
        addTask: (text) => addTask(taskRepository, text),
        deleteTask: (id) => deleteTask(taskRepository, id),
    };
}

async function addTask(taskRepository, text) {
    const tasks = await taskRepository.readTasks();
    const task = { id: randomUUID(), text, done: false };
    tasks.push(task);
    await taskRepository.writeTasks(tasks);
    return task;
}

async function deleteTask(taskRepository, id) {
    const tasks = await taskRepository.readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
        return false;
    }
    tasks.splice(taskIndex, 1);
    await taskRepository.writeTasks(tasks);
    return true;
}

module.exports = { createTaskService };
