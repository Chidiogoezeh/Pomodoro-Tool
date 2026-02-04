// --- Configuration & State ---
let TIME_SETTINGS = {
    pomodoro: 25 * 60,
    break: 5 * 60
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

// --- UI Helpers (Secure DOM Manipulation) ---
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
    label.textContent = task.description; 

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

// --- Core Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const settingsPanel = document.getElementById('timer-settings');
    const alarmContainer = document.getElementById('alarm-status-container');
    const stopSoundBtn = document.getElementById('stop-sound-btn');

    // 1. Initial Load
    updateDisplay();
    fetchTasks();

    // 2. Timer Event Listeners
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
    document.getElementById('toggle-settings-btn').addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        const focusMins = document.getElementById('input-pomodoro').value || 25;
        const breakMins = document.getElementById('input-break').value || 5;
        
        TIME_SETTINGS.pomodoro = parseInt(focusMins) * 60;
        TIME_SETTINGS.break = parseInt(breakMins) * 60;
        
        settingsPanel.classList.add('hidden');
        resetTimer();
    });

    document.getElementById('alarm-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                alarmSound = new Audio(ev.target.result);
                alarmSound.loop = true;
                console.log("Alarm sound loaded and looped.");
            };
            reader.readAsDataURL(file);
        }
    });

    stopSoundBtn.addEventListener('click', () => {
        if (alarmSound) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        }
        alarmContainer.classList.add('hidden');
    });

    // 4. Task Management Listeners
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

    // 5. Auth & Mode Switchers
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    ['pomodoro', 'break'].forEach(mode => {
        const btn = document.getElementById(`${mode}-btn`);
        if (btn) btn.addEventListener('click', () => switchMode(mode));
    });

    // --- Logic Functions (Scoped inside DOMContentLoaded) ---
    function tick() {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateDisplay();
        } else {
            handleTimerComplete();
        }
    }

    async function handleTimerComplete() {
        clearInterval(intervalId);
        isRunning = false;

        // Trigger Sound
        if (alarmSound) {
            alarmContainer.classList.remove('hidden');
            alarmSound.play().catch(err => console.error("Autoplay blocked:", err));
        }
        
        // Log Session
        await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({ 
                duration: TIME_SETTINGS[currentMode], 
                type: currentMode 
            })
        });

        resetTimer();
    }

    async function fetchTasks() {
        const data = await apiRequest('/tasks');
        if (data?.success) {
            tasksContainer.textContent = ''; 
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
        document.getElementById(`${mode}-btn`).classList.add('active');
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