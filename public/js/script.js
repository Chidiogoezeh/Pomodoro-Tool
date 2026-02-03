// --- Configuration & State ---
let TIME_SETTINGS = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

const API_URL = '/api/v1';
let currentMode = 'pomodoro';
let timeRemaining = TIME_SETTINGS[currentMode];
let isRunning = false;
let intervalId = null;
let alarmSound = null;

// --- Authorized Fetch Wrapper ---
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

// --- UI Helpers (Strict Security: No innerHTML) ---
function updateDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    document.getElementById('minutes').textContent = mins.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = secs.toString().padStart(2, '0');
    document.title = `${mins}:${secs.toString().padStart(2, '0')} - Pomodoro`;
}

const createTaskElement = (task) => {
    const li = document.createElement('li');
    if (task.isCompleted) li.classList.add('completed');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task._id}`;
    checkbox.checked = task.isCompleted;

    const label = document.createElement('label');
    label.setAttribute('for', `task-${task._id}`);
    label.textContent = task.description; // Securely set text

    checkbox.addEventListener('change', async (e) => {
        const data = await apiRequest(`/tasks/${task._id}`, {
            method: 'PUT',
            body: JSON.stringify({ isCompleted: e.target.checked })
        });
        if (data?.success) {
            li.classList.toggle('completed', e.target.checked);
        }
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    return li;
};

// --- Initialization & Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');

    // 1. Initial Load
    updateDisplay();
    fetchTasks();

    // 2. Timer Controls
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

    // 3. Audio & Settings Listeners
    document.getElementById('alarm-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => alarmSound = new Audio(ev.target.result);
            reader.readAsDataURL(file);
        }
    });

    ['pomodoro', 'short-break', 'long-break'].forEach(id => {
        document.getElementById(`input-${id}`).addEventListener('change', () => {
            const key = id.replace(/-([a-z])/g, g => g[1].toUpperCase()); // convert short-break to shortBreak
            TIME_SETTINGS[key] = (document.getElementById(`input-${id}`).value || 1) * 60;
            if (!isRunning) resetTimer();
        });
    });

    // 4. Task Management
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const description = taskInput.value.trim();
            if (!description) return;
            const data = await apiRequest('/tasks', {
                method: 'POST',
                body: JSON.stringify({ description })
            });
            if (data?.success) {
                tasksContainer.appendChild(createTaskElement(data.data));
                taskInput.value = '';
            }
        });
    }

    document.getElementById('clear-tasks-btn').addEventListener('click', clearCompletedTasks);

    // 5. Mode Selectors
    ['pomodoro', 'shortBreak', 'longBreak'].forEach(mode => {
        const btnId = mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) + "-btn";
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => switchMode(mode));
    });

    // --- Logic Functions ---
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
        if (alarmSound) alarmSound.play();
        await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({ duration: TIME_SETTINGS[currentMode], type: currentMode })
        });
        resetTimer();
    }

    async function fetchTasks() {
        const data = await apiRequest('/tasks');
        if (data?.success) {
            tasksContainer.textContent = ''; // Secure clear
            data.data.forEach(task => tasksContainer.appendChild(createTaskElement(task)));
        }
    }

    async function clearCompletedTasks() {
        const data = await apiRequest('/tasks');
        if (data?.success) {
            const completed = data.data.filter(t => t.isCompleted);
            for (const task of completed) {
                await apiRequest(`/tasks/${task._id}`, { method: 'DELETE' });
            }
            fetchTasks();
        }
    }

    function switchMode(mode) {
        currentMode = mode;
        document.querySelectorAll('.timer-mode-selector button').forEach(b => b.classList.remove('active'));
        document.getElementById(`${mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}-btn`).classList.add('active');
        resetTimer();
    }

    function resetTimer() {
        clearInterval(intervalId);
        isRunning = false;
        timeRemaining = TIME_SETTINGS[currentMode];
        toggleControls(false);
        updateDisplay();
    }

    function toggleControls(running) {
        document.getElementById('start-btn').classList.toggle('hidden', running);
        document.getElementById('pause-btn').classList.toggle('hidden', !running);
    }
});