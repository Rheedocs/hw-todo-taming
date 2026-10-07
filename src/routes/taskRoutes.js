const express = require('express');

/**
 * Creates task routes connected to controller handlers.
 * @param {Object} taskController
 */
function createTaskRoutes(taskController) {
    const router = express.Router();
    router.get('/', taskController.handleGetTasks);
    router.post('/', taskController.handleAddTask);
    router.delete('/:id', taskController.handleDeleteTask);
    return router;
}

module.exports = { createTaskRoutes };
