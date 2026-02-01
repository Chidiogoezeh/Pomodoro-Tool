// --- Configuration ---
const TIME_SETTINGS = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};
const API_URL = '/api/v1';

let currentMode = 'pomodoro';
let timeRemaining = TIME_SETTINGS[currentMode];
let isRunning = false;
let intervalId = null;

// DOM Elements
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const tasksContainer = document.getElementById('tasks-container');

// Helper to create task elements safely
const createTaskElement = (task) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const label = document.createElement('label');

    checkbox.type = 'checkbox';
    checkbox.id = `task-${task._id}`;
    checkbox.checked = task.isCompleted;
    
    label.setAttribute('for', `task-${task._id}`);
    label.textContent = task.description;

    if (task.isCompleted) {
        li.classList.add('completed');
    }

    checkbox.addEventListener('change', async (e) => {
        await toggleTaskStatus(task._id, e.target.checked);
        li.classList.toggle('completed', e.target.checked);
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    return li;
};

async function fetchTasks() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            tasksContainer.textContent = ''; // Clear container
            data.data.forEach(task => {
                tasksContainer.appendChild(createTaskElement(task));
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Initializing event listeners
document.getElementById('start-btn').addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        intervalId = setInterval(tick, 1000);
        toggleControls(true);
    }
});

function toggleControls(running) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    startBtn.classList.toggle('hidden', running);
    pauseBtn.classList.toggle('hidden', !running);
}

// Tick and UI updates... (rest of logic follows ES6)