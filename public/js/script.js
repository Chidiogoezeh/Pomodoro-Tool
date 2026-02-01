// --- Configuration ---
const TIME_SETTINGS = {
    pomodoro: 25 * 60, // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60 // 15 minutes
};
const LONG_BREAK_INTERVAL = 4;
const API_URL = '/api/v1'; // Base URL for the Express API

// --- State Variables ---
let currentMode = 'pomodoro';
let timeRemaining = TIME_SETTINGS[currentMode];
let isRunning = false;
let intervalId = null;
let pomodoroCount = 0;

// --- DOM Elements ---
// (Same as before)
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionCountEl = document.getElementById('session-count');

const pomodoroBtn = document.getElementById('pomodoro-btn');
const shortBreakBtn = document.getElementById('short-break-btn');
const longBreakBtn = document.getElementById('long-break-btn');
const modeButtons = [pomodoroBtn, shortBreakBtn, longBreakBtn];

const tasksContainer = document.getElementById('tasks-container');

// --- API Functions ---

async function fetchTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks`);
        const data = await res.json();

        if (data.success) {
            renderTasks(data.data);
            // Optionally, update initial pomodoro count based on past data
            // For simplicity, we keep pomodoroCount reset on page load here.
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

async function logSession() {
    // Only log completed Pomodoro sessions
    if (currentMode !== 'pomodoro') return;

    try {
        const sessionData = {
            duration: TIME_SETTINGS.pomodoro / 60, // Duration in minutes (25)
            type: currentMode
        };

        await fetch(`${API_URL}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        });
    } catch (error) {
        console.error('Error logging session:', error);
    }
}

async function toggleTaskStatus(taskId, isCompleted) {
    try {
        await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted: isCompleted })
        });
        // Re-fetch or update UI locally
        // fetchTasks(); 
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// --- UI Rendering ---

function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" id="task-${task._id}" ${task.isCompleted ? 'checked' : ''}>
            <label for="task-${task._id}">${task.description}</label>
        `;
        
        const checkbox = li.querySelector('input');
        checkbox.addEventListener('change', (e) => {
            toggleTaskStatus(task._id, e.target.checked);
            // Optional: visually strike-through completed tasks
            li.style.textDecoration = e.target.checked ? 'line-through' : 'none';
        });

        if (task.isCompleted) {
            li.style.textDecoration = 'line-through';
        }
        
        tasksContainer.appendChild(li);
    });
}

// --- Timer Logic (Modified Tick) ---

function formatTime(totalSeconds) {
    // (Same function as before)
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
    };
}

function updateDisplay() {
    // (Same function as before)
    const { minutes, seconds } = formatTime(timeRemaining);
    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds;
    document.title = `${minutes}:${seconds} | Pomodoro Timer`;
}

function tick() {
    if (timeRemaining > 0) {
        timeRemaining--;
        updateDisplay();
    } else {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
        
        if (currentMode === 'pomodoro') {
            // *** API CALL: Log session to MongoDB ***
            logSession(); 
            
            pomodoroCount++;
            sessionCountEl.textContent = pomodoroCount;

            const nextMode = (pomodoroCount % LONG_BREAK_INTERVAL === 0) ? 'longBreak' : 'shortBreak';
            switchMode(nextMode);
        } else {
            switchMode('pomodoro');
        }

        startBtn.style.display = 'inline';
        pauseBtn.style.display = 'none';
        
        // Visual/Audio alert
        document.body.classList.add('time-up');
        setTimeout(() => document.body.classList.remove('time-up'), 1000);
        // playAlarm(); // Add actual sound here
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        intervalId = setInterval(tick, 1000);
        startBtn.style.display = 'none';
        pauseBtn.style.display = 'inline';
    }
}

function pauseTimer() {
    if (isRunning) {
        clearInterval(intervalId);
        isRunning = false;
        startBtn.style.display = 'inline';
        pauseBtn.style.display = 'none';
    }
}

function resetTimer() {
    pauseTimer(); 
    timeRemaining = TIME_SETTINGS[currentMode];
    updateDisplay();
}

function switchMode(newMode) {
    pauseTimer(); 
    currentMode = newMode;
    timeRemaining = TIME_SETTINGS[currentMode];
    
    updateDisplay();

    modeButtons.forEach(btn => btn.classList.remove('active'));
    if (newMode === 'pomodoro') pomodoroBtn.classList.add('active');
    else if (newMode === 'shortBreak') shortBreakBtn.classList.add('active');
    else if (newMode === 'longBreak') longBreakBtn.classList.add('active');
}


// --- Event Listeners and Initialization ---

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

pomodoroBtn.addEventListener('click', () => switchMode('pomodoro'));
shortBreakBtn.addEventListener('click', () => switchMode('shortBreak'));
longBreakBtn.addEventListener('click', () => switchMode('longBreak'));

// Initial setup
updateDisplay();
fetchTasks(); // Load tasks from the database on startup