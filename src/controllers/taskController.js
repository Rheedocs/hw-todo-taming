const MAX_TEXT_LENGTH = 200;

/**
 * Creates HTTP handlers for task operations.
 * @param {{ getAllTasks: () => Promise<object[]>, addTask: (text: string) => Promise<object>, deleteTask: (id: string) => Promise<boolean> }} taskService
 */
function createTaskController(taskService) {
    const handleGetTasks = async (req, res) => {
        try {
            return res.status(200).json(await taskService.getAllTasks());
        } catch {
            return res.status(500).json({ error: 'Kunne ikke hente opgaverne.' });
        }
    };

    const handleAddTask = async (req, res) => {
        const text = req.body?.text;
        if (typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Opgavens tekst må ikke være tom.' });
        }
        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ error: 'Opgavens tekst må højst være 200 tegn.' });
        }
        try {
            return res.status(201).json(await taskService.addTask(text));
        } catch {
            return res.status(500).json({ error: 'Kunne ikke gemme opgaven.' });
        }
    };

    const handleDeleteTask = async (req, res) => {
        try {
            const deleted = await taskService.deleteTask(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Opgaven blev ikke fundet.' });
            }
            return res.status(204).end();
        } catch {
            return res.status(500).json({ error: 'Kunne ikke slette opgaven.' });
        }
    };

    return { handleGetTasks, handleAddTask, handleDeleteTask };
}

module.exports = { createTaskController };
