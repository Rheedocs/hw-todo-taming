const { randomUUID } = require('node:crypto');

/**
 * Creates task business logic using an injected repository.
 * @param {{ readTasks: () => Promise<object[]>, writeTasks: (tasks: object[]) => Promise<void> }} taskRepository
 */
function createTaskService(taskRepository) {
    async function addTask(text) {
        const tasks = await taskRepository.readTasks();
        const task = { id: randomUUID(), text, done: false };
        tasks.push(task);
        await taskRepository.writeTasks(tasks);
        return task;
    }

    async function deleteTask(id) {
        const tasks = await taskRepository.readTasks();
        const taskIndex = tasks.findIndex((task) => task.id === id);
        if (taskIndex === -1) {
            return false;
        }
        tasks.splice(taskIndex, 1);
        await taskRepository.writeTasks(tasks);
        return true;
    }

    return {
        getAllTasks: () => taskRepository.readTasks(),
        addTask,
        deleteTask,
    };
}

module.exports = { createTaskService };
