const MAX_TEXT_LENGTH = 200;

// Logs the real error for the developer, sends a fixed Danish message to the user.
function sendServerError(res, action, error, message) {
    console.error(`Failed to ${action}:`, error);
    return res.status(500).json({ error: message });
}

// Returns the trimmed text, or '' if text is missing or not a string.
function readText(req) {
    const text = req.body?.text;
    return typeof text === 'string' ? text.trim() : '';
}

/**
 * Creates HTTP handlers for task operations.
 * @param {{ getAllTasks: () => Promise<object[]>, addTask: (text: string) => Promise<object>, deleteTask: (id: string) => Promise<boolean>, setTaskDone: (id: string, done: boolean) => Promise<object | null> }} taskService
 */
function createTaskController(taskService) {
    const handleGetTasks = async (req, res) => {
        try {
            return res.status(200).json(await taskService.getAllTasks());
        } catch (error) {
            return sendServerError(res, 'get tasks', error, 'Kunne ikke hente opgaverne.');
        }
    };

    const handleAddTask = async (req, res) => {
        const text = readText(req);
        if (text === '') {
            return res.status(400).json({ error: 'Opgavens tekst må ikke være tom.' });
        }
        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ error: 'Opgavens tekst må højst være 200 tegn.' });
        }
        try {
            return res.status(201).json(await taskService.addTask(text));
        } catch (error) {
            return sendServerError(res, 'add task', error, 'Kunne ikke gemme opgaven.');
        }
    };

    const handleDeleteTask = async (req, res) => {
        try {
            const deleted = await taskService.deleteTask(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Opgaven blev ikke fundet.' });
            }
            return res.status(204).end();
        } catch (error) {
            return sendServerError(res, 'delete task', error, 'Kunne ikke slette opgaven.');
        }
    };

    const handleSetDone = async (req, res) => {
        const done = req.body?.done;
        if (typeof done !== 'boolean') {
            return res.status(400).json({ error: 'Feltet done skal være sand eller falsk.' });
        }
        try {
            const task = await taskService.setTaskDone(req.params.id, done);
            if (!task) {
                return res.status(404).json({ error: 'Opgaven blev ikke fundet.' });
            }
            return res.status(200).json(task);
        } catch (error) {
            return sendServerError(res, 'update task', error, 'Kunne ikke opdatere opgaven.');
        }
    };

    return { handleGetTasks, handleAddTask, handleDeleteTask, handleSetDone };
}

module.exports = { createTaskController };