const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const errorMessage = document.querySelector('#error-message');
const themeToggle = document.querySelector('#theme-toggle');

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
    const left = document.createElement('div');
    const checkbox = document.createElement('input');
    const text = document.createElement('span');
    const button = document.createElement('button');

    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    left.className = 'd-flex align-items-center gap-2';
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input mt-0';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', `Marker ${task.text} som færdig`);
    checkbox.addEventListener('change', () => setDone(task.id, checkbox.checked));
    text.textContent = task.text;
    text.classList.toggle('text-decoration-line-through', task.done);
    button.type = 'button';
    button.className = 'btn btn-outline-danger btn-sm';
    button.textContent = 'Slet';
    button.setAttribute('aria-label', `Slet ${task.text}`);
    button.addEventListener('click', () => deleteTask(task.id));
    left.append(checkbox, text);
    item.append(left, button);
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

async function setDone(id, done) {
  try {
    const response = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done }),
    });
    if (!response.ok) {
      showError('Opgaven kunne ikke opdateres.');
      await loadTasks();
      return;
    }
    clearError();
    await loadTasks();
  } catch {
    showError('Der opstod en fejl ved opdatering af opgaven.');
  }
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask();
});

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-bs-theme');
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-bs-theme', nextTheme);
  themeToggle.textContent = nextTheme === 'light' ? 'Mørkt tema' : 'Lyst tema';
});

loadTasks();