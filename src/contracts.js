/**
 * Kontrakter for To Do Taming.
 *
 * Kun JSDoc typer, ingen kode. Filen beskriver, hvilke funktioner lagene
 * tilbyder hinanden, så alle kan skrive mod de samme navne.
 * Ændres kun efter aftale i gruppen (eget issue).
 *
 * Brug i andre filer:
 * @param {import('../contracts').TaskRepository} taskRepository
 */

/**
 * En opgave.
 * @typedef {Object} Task
 * @property {string} id Unikt id fra crypto.randomUUID().
 * @property {string} text Opgavens tekst.
 * @property {boolean} done Status. Starter som false.
 */

/**
 * Filadgang. Det eneste sted der bruger fs-extra.
 * @typedef {Object} TaskRepository
 * @property {() => Promise<Task[]>} readTasks Læser alle opgaver fra data/tasks.json. Kaster en fejl, hvis filen ikke kan læses.
 * @property {(tasks: Task[]) => Promise<void>} writeTasks Overskriver filen med hele listen. Kaster en fejl, hvis det fejler.
 */

/**
 * Forretningslogik. Kender ikke Express.
 * @typedef {Object} TaskService
 * @property {() => Promise<Task[]>} getAllTasks Returnerer alle opgaver.
 * @property {(text: string) => Promise<Task>} addTask Laver en ny opgave (id, text, done false), gemmer den og returnerer den.
 * @property {(id: string) => Promise<boolean>} deleteTask Sletter opgaven. Returnerer true hvis den blev slettet, false hvis id'et ikke findes.
 */

/**
 * Det createApp får ind udefra.
 * @typedef {Object} AppDependencies
 * @property {TaskRepository} taskRepository
 */

module.exports = {};