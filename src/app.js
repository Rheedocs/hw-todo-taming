const path = require('node:path');
const express = require('express');
const { createTaskController } = require('./controllers/taskController');
const { createTaskService } = require('./services/taskService');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

/**
 * Builds the Express app using the supplied task repository.
 * @param {{ taskRepository: { readTasks: () => Promise<object[]>, writeTasks: (tasks: object[]) => Promise<void> } }} dependencies
 */
function createApp({ taskRepository }) {
    const app = express();
    const taskService = createTaskService(taskRepository);
    const taskController = createTaskController(taskService);
    const router = express.Router();
    const publicPath = path.join(__dirname, '..', 'public');

    app.use(express.json());
    app.use(express.static(publicPath));
    router.get('/', taskController.handleGetTasks);
    router.post('/', taskController.handleAddTask);
    router.delete('/:id', taskController.handleDeleteTask);
    app.use('/api/tasks', router);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
