const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const toggleTheme = document.getElementById('theme-toggle');

// Load from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    if ((currentFilter === 'active' && task.completed) ||
        (currentFilter === 'completed' && !task.completed)) return;

    const li = document.createElement('li');
    li.className = task.completed ? 'checked' : '';
    li.innerHTML = `
      <span onclick="toggleTask(${index})">${task.text}</span>
      <div>
        <button onclick="editTask(${index})">✏️</button>
        <button class="delete" onclick="deleteTask(${index})">❌</button>
      </div>
    `;
    taskList.appendChild(li);
  });
}

// Request permission on load
requestNotificationPermission();

function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  }
}

function showNotification(taskText) {
  if (Notification.permission === 'granted') {
    new Notification('Task Added ✅', {
      body: `"${taskText}" was added to your To-Do List.`,
      icon: 'icon-192.png'
    });
  }
}

function addTask() {
  const text = taskInput.value.trim();
  if (text !== '') {
    tasks.push({ text, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();

    showNotification(text);
  }
}


function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveTasks();
    renderTasks();
  }
}

function filterTasks(type) {
  currentFilter = type;
  renderTasks();
}

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTask();
});

toggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Apply saved theme
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// Load tasks
renderTasks();

// Register PWA service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('✅ Service Worker Registered'))
    .catch(err => console.error('Service Worker failed:', err));
}
