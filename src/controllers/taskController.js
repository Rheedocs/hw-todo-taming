/**
 * Creates HTTP handlers for task operations.
 * @param {import('../contracts').TaskService} taskService
 */
function createTaskController(taskService) {
    return {
        handleGetTasks: (req, res) => handleGetTasks(taskService, req, res),
        handleAddTask: (req, res) => handleAddTask(taskService, req, res),
        handleDeleteTask: (req, res) => handleDeleteTask(taskService, req, res),
    };
}

async function handleGetTasks(taskService, req, res) {
    try {
        const tasks = await taskService.getAllTasks();
        return res.status(200).json(tasks);
    } catch {
        return sendServerError(res, 'Kunne ikke hente opgaverne.');
    }
}

async function handleAddTask(taskService, req, res) {
    const text = req.body?.text;
    if (typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ error: 'Opgavens tekst må ikke være tom.' });
    }
    try {
        const task = await taskService.addTask(text);
        return res.status(201).json(task);
    } catch {
        return sendServerError(res, 'Kunne ikke gemme opgaven.');
    }
}

async function handleDeleteTask(taskService, req, res) {
    try {
        const deleted = await taskService.deleteTask(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Opgaven blev ikke fundet.' });
        }
        return res.status(204).end();
    } catch {
        return sendServerError(res, 'Kunne ikke slette opgaven.');
    }
}

function sendServerError(res, message) {
    return res.status(500).json({ error: message });
}

module.exports = { createTaskController };
