const fs = require('fs-extra');

/**
 * Creates file access methods for the task list.
 * @param {string} filePath Path to the JSON file.
 * @returns {import('../contracts').TaskRepository}
 */
function createTaskRepository(filePath) {
    return {
        readTasks: () => fs.readJson(filePath),
        writeTasks: (tasks) => fs.writeJson(filePath, tasks),
    };
}

module.exports = { createTaskRepository };
