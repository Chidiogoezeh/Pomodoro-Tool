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
let objectURL = null; 

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

// --- UI Helpers ---
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
        if (data?.success) li.classList.toggle('completed', e.target.checked);
    });
    li.appendChild(checkbox);
    li.appendChild(label);
    return li;
};

// --- Core Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tasksContainer = document.getElementById('tasks-container');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const settingsPanel = document.getElementById('timer-settings');
    const alarmContainer = document.getElementById('alarm-status-container');
    const stopSoundBtn = document.getElementById('stop-sound-btn');
    const alarmAudio = document.getElementById('alarm-audio'); 

    updateDisplay();
    fetchTasks();

    // 1. Timer Controls
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            // Unlock audio
            if (alarmAudio && alarmAudio.src) {
                alarmAudio.play().then(() => {
                    alarmAudio.pause();
                    alarmAudio.currentTime = 0;
                }).catch(e => console.log("Audio ready for completion."));
            }
            
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

    // 2. Audio & Settings
    document.getElementById('toggle-settings-btn').addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    document.getElementById('save-settings-btn').addEventListener('click', () => {
        TIME_SETTINGS.pomodoro = (parseInt(document.getElementById('input-pomodoro').value) || 25) * 60;
        TIME_SETTINGS.break = (parseInt(document.getElementById('input-break').value) || 5) * 60;
        settingsPanel.classList.add('hidden');
        resetTimer();
    });

    document.getElementById('alarm-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (objectURL) URL.revokeObjectURL(objectURL);
            objectURL = URL.createObjectURL(file);
            alarmAudio.src = objectURL;
            alarmAudio.load();
            console.log("Audio Blob loaded.");
        }
    });

    stopSoundBtn.addEventListener('click', () => {
        alarmAudio.pause();
        alarmAudio.currentTime = 0;
        alarmContainer.classList.add('hidden');
    });

    // 3. Logic Functions
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

        // Show STOP button immediately
        alarmContainer.classList.remove('hidden');

        // Play Sound
        if (alarmAudio && alarmAudio.src) {
            try {
                await alarmAudio.play();
            } catch (err) {
                console.error("Playback blocked:", err);
            }
        }
        
        await apiRequest('/sessions', {
            method: 'POST',
            body: JSON.stringify({ duration: TIME_SETTINGS[currentMode], type: currentMode })
        });
        resetTimer();
    }

    function switchMode(mode) {
        currentMode = mode;
        document.querySelectorAll('.timer-mode-selector button').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`${mode}-btn`);
        if (btn) btn.classList.add('active');
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

    // 4. Task & Auth Management
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

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
    });

    ['pomodoro', 'break'].forEach(mode => {
        const btn = document.getElementById(`${mode}-btn`);
        if (btn) btn.addEventListener('click', () => switchMode(mode));
    });
});