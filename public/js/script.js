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

// --- Timer Display Functions ---
function updateDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    document.getElementById('minutes').textContent = mins.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = secs.toString().padStart(2, '0');
    document.title = `${mins}:${secs.toString().padStart(2, '0')} - Pomodoro`;
}

function toggleControls(running) {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    if (startBtn && pauseBtn) {
        startBtn.classList.toggle('hidden', running);
        pauseBtn.classList.toggle('hidden', !running);
    }
}

// --- Task UI Helper ---
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
        if (data?.success) {
            li.classList.toggle('completed', e.target.checked);
            console.log(`[${new Date().toISOString()}] INFO: Task ${task._id} status updated.`);
        }
    });

    return li;
};

// --- Core Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');

    // 1. Initial Load
    updateDisplay();
    fetchTasks();

    // 2. Timer Actions
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            intervalId = setInterval(() => {
                if (timeRemaining > 0) {
                    timeRemaining--;
                    updateDisplay();
                } else {
                    clearInterval(intervalId);
                    isRunning = false;
                    handleTimerComplete();
                }
            }, 1000);
            toggleControls(true);
        }
    });

    document.getElementById('pause-btn').addEventListener('click', () => {
        isRunning = false;
        clearInterval(intervalId);
        toggleControls(false);
    });

    document.getElementById('reset-btn').addEventListener('click', resetTimer);

    // 3. Mode Selectors
    ['pomodoro', 'shortBreak', 'longBreak'].forEach(mode => {
        const btnId = mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase()) + "-btn";
        const btn = document.getElementById(btnId);
        if (btn) btn.addEventListener('click', () => switchMode(mode));
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

    // 5. Auth Actions
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    // --- Inner Functions ---
    async function fetchTasks() {
        const data = await apiRequest('/tasks');
        if (data?.success) {
            tasksContainer.innerHTML = '';
            data.data.forEach(task => tasksContainer.appendChild(createTaskElement(task)));
        }
    }

    async function handleTimerComplete() {
        await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({ duration: TIME_SETTINGS[currentMode], type: currentMode })
        });
        alert(`${currentMode} finished! Session logged.`);
        resetTimer();
    }

    function switchMode(mode) {
        currentMode = mode;
        document.querySelectorAll('.timer-mode-selector button').forEach(b => b.classList.remove('active'));
        const activeBtnId = `${mode.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}-btn`;
        document.getElementById(activeBtnId).classList.add('active');
        resetTimer();
    }

    function resetTimer() {
        clearInterval(intervalId);
        isRunning = false;
        timeRemaining = TIME_SETTINGS[currentMode];
        toggleControls(false);
        updateDisplay();
    }
});