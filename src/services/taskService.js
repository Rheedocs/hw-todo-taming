const { randomUUID } = require('node:crypto');

/**
 * Creates task business logic using an injected repository.
 * Every operation runs through a queue, so read-modify-write cycles never overlap.
 * @param {{ readTasks: () => Promise<object[]>, writeTasks: (tasks: object[]) => Promise<void> }} taskRepository
 */
function createTaskService(taskRepository) {
    let queue = Promise.resolve();

    // Runs one operation at a time. A failed operation must not block the ones after it.
    function enqueue(operation) {
        const result = queue.then(operation);
        queue = result.catch(() => {});
        return result;
    }

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

    async function setTaskDone(id, done) {
        const tasks = await taskRepository.readTasks();
        const task = tasks.find((candidate) => candidate.id === id);
        if (!task) {
            return null;
        }
        task.done = done;
        await taskRepository.writeTasks(tasks);
        return task;
    }

    return {
        getAllTasks: () => enqueue(() => taskRepository.readTasks()),
        addTask: (text) => enqueue(() => addTask(text)),
        deleteTask: (id) => enqueue(() => deleteTask(id)),
        setTaskDone: (id, done) => enqueue(() => setTaskDone(id, done)),
    };
}

module.exports = { createTaskService };