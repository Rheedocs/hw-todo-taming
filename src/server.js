const path = require('node:path');
const { createApp } = require('./app');
const { createTaskRepository } = require('./repositories/taskRepository');

const taskFilePath = path.join(__dirname, '..', 'data', 'tasks.json');
const taskRepository = createTaskRepository(taskFilePath);
const app = createApp({ taskRepository });

app.listen(3000);
