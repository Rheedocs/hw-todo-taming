const path = require('node:path');
const express = require('express');
const { createTaskController } = require('./controllers/taskController');
const { createTaskRoutes } = require('./routes/taskRoutes');
const { createTaskService } = require('./services/taskService');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

/**
 * Builds the Express application and connects its dependencies.
 * @param {import('./contracts').AppDependencies} dependencies
 */
function createApp({ taskRepository }) {
    const app = express();
    const taskService = createTaskService(taskRepository);
    const taskController = createTaskController(taskService);
    const taskRoutes = createTaskRoutes(taskController);
    const publicPath = path.join(__dirname, '..', 'public');

    app.use(express.json());
    app.use(express.static(publicPath));
    app.use('/api/tasks', taskRoutes);
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

module.exports = { createApp };
