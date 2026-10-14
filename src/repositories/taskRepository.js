const fs = require('fs-extra');

/**
 * Creates file access methods for the task list.
 * @param {string} filePath Path to the JSON file.
 * @returns {{ readTasks: () => Promise<object[]>, writeTasks: (tasks: object[]) => Promise<void> }}
 */
function createTaskRepository(filePath) {
    return {
        readTasks: () => fs.readJson(filePath),
        writeTasks: (tasks) => fs.writeJson(filePath, tasks),
    };
}

module.exports = { createTaskRepository };
