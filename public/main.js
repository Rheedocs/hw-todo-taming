const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const errorMessage = document.querySelector('#error-message');

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function clearError() {
  errorMessage.textContent = '';
  errorMessage.hidden = true;
}

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) {
      showError('Opgaverne kunne ikke hentes.');
      return;
    }
    renderTasks(await response.json());
    clearError();
  } catch {
    showError('Der opstod en fejl ved hentning af opgaver.');
  }
}

function renderTasks(tasks) {
  taskList.replaceChildren();
  tasks.forEach((task) => {
    const item = document.createElement('li');
    const text = document.createElement('span');
    const button = document.createElement('button');

    text.textContent = task.text;
    button.type = 'button';
    button.textContent = 'Slet';
    button.setAttribute('aria-label', `Slet ${task.text}`);
    button.addEventListener('click', () => deleteTask(task.id));
    item.append(text, button);
    taskList.append(item);
  });
}

async function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    showError('Skriv en opgave, før du tilføjer den.');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      showError('Opgaven kunne ikke tilføjes.');
      return;
    }
    taskInput.value = '';
    clearError();
    await loadTasks();
  } catch {
    showError('Der opstod en fejl ved tilføjelse af opgaven.');
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      showError('Opgaven kunne ikke slettes.');
      return;
    }
    clearError();
    await loadTasks();
  } catch {
    showError('Der opstod en fejl ved sletning af opgaven.');
  }
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask();
});

loadTasks();
