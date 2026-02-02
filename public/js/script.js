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

// --- Authorized Fetch Wrapper ---
// Standardizes API calls and handles expired tokens globally
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, { ...defaultOptions, ...options });
        
        // If token is expired or invalid
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        return await response.json();
    } catch (error) {
        console.error(`[${new Date().toISOString()}] FETCH ERROR:`, error);
    }
}

// --- Timer Logic ---
function updateDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    document.getElementById('minutes').textContent = mins.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = secs.toString().padStart(2, '0');
    document.title = `${mins}:${secs.toString().padStart(2, '0')} - Pomodoro`;
}

function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        clearInterval(intervalId);
        isRunning = false;
        handleTimerComplete();
    }
}

async function handleTimerComplete() {
    // Log session to DB
    await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({ duration: TIME_SETTINGS[currentMode], type: currentMode })
    });

    alert(`${currentMode.replace(/([A-Z])/g, ' $1')} finished!`);
    resetTimer();
}

// --- Task Logic ---
const tasksContainer = document.getElementById('tasks-container');

const createTaskElement = (task) => {
    const li = document.createElement('li');
    li.className = task.isCompleted ? 'completed' : '';
    
    li.innerHTML = `
        <input type="checkbox" id="task-${task._id}" ${task.isCompleted ? 'checked' : ''}>
        <label for="task-${task._id}">${task.description}</label>
    `;

    li.querySelector('input').addEventListener('change', async (e) => {
        const data = await apiRequest(`/tasks/${task._id}`, {
            method: 'PUT',
            body: JSON.stringify({ isCompleted: e.target.checked })
        });
        if (data?.success) li.classList.toggle('completed', e.target.checked);
    });

    return li;
};

async function fetchTasks() {
    const data = await apiRequest('/tasks');
    if (data?.success) {
        tasksContainer.innerHTML = '';
        data.data.forEach(task => tasksContainer.appendChild(createTaskElement(task)));
    }
}

// --- Event Listeners & Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    fetchTasks();
    updateDisplay();

    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            intervalId = setInterval(tick, 1000);
            toggleControls(true);
        }
    });

    document.getElementById('pause-btn').addEventListener('click', () => {
        isRunning = false;
        clearInterval(intervalId);
        toggleControls(false);
    });

    document.getElementById('reset-btn').addEventListener('click', resetTimer);

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    // Mode selectors
    ['pomodoro', 'shortBreak', 'longBreak'].forEach(mode => {
        const btnId = mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) + "-btn";
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => switchMode(mode));
        }
    });
});

function resetTimer() {
    clearInterval(intervalId);
    isRunning = false;
    timeRemaining = TIME_SETTINGS[currentMode];
    toggleControls(false);
    updateDisplay();
}

function switchMode(mode) {
    currentMode = mode;
    // Update active UI button
    document.querySelectorAll('.timer-mode-selector button').forEach(b => b.classList.remove('active'));
    document.getElementById(`${mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}-btn`).classList.add('active');
    resetTimer();
}

function toggleControls(running) {
    document.getElementById('start-btn').classList.toggle('hidden', running);
    document.getElementById('pause-btn').classList.toggle('hidden', !running);
}

// --- Add Task Logic ---
const addTaskForm = document.getElementById('add-task-form');
const taskInput = document.getElementById('task-input');

if (addTaskForm) {
    addTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const description = taskInput.value.trim();
        if (!description) return;

        // Send to backend
        const data = await apiRequest('/tasks', {
            method: 'POST',
            body: JSON.stringify({ description })
        });

        if (data?.success) {
            // Append the new task to the list
            tasksContainer.appendChild(createTaskElement(data.data));
            taskInput.value = ''; // Clear input
            console.log(`[${new Date().toISOString()}] INFO: New task added via UI`);
        } else {
            alert(data.error || 'Failed to add task');
        }
    });
}