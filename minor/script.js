document.addEventListener('DOMContentLoaded', () => {
    // Timer and Task Elements
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const restartButton = document.getElementById('restart');
    const watchDisplay = document.querySelector('.watch-display');
    const pomodoroButton = document.getElementById('pomodoro');
    const shortBreakButton = document.getElementById('shortBreak');
    const longBreakButton = document.getElementById('longBreak');
    const taskInput = document.getElementById('taskInput');
    const pomodoroEstimate = document.getElementById('pomodoroEstimate');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const priorityTask = document.getElementById('priorityTask');
    const notification = document.getElementById('notification');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const overlay = document.getElementById('overlay');
    
    // Timer State
    let timer, minutes = 25, seconds = 0;
    let isRunning = false, isPaused = false, completedPomodoros = 0, isBreak = false;
    let pomodoroTime = 25, shortBreakTime = 5, longBreakTime = 15;
    let modes = { pomodoro: pomodoroTime, shortBreak: shortBreakTime, longBreak: longBreakTime };
    let currentMode = 'pomodoro';

    loadSettings();
    updateDisplay();

    // ===== Event Listeners =====
    pomodoroButton.addEventListener('click', () => setMode('pomodoro'));
    shortBreakButton.addEventListener('click', () => setMode('shortBreak'));
    longBreakButton.addEventListener('click', () => setMode('longBreak'));
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopOrResumeTimer);
    restartButton.addEventListener('click', restartTimer);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());
    settingsBtn.addEventListener('click', toggleSettingsPanel);
    closeSettingsBtn.addEventListener('click', closeSettingsPanel);
    overlay.addEventListener('click', closeSettingsPanel);
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeSettingsPanel());

    // Settings Save & Reset
    document.getElementById('saveSettings')?.addEventListener('click', saveSettingsHandler);
    document.getElementById('resetSettings')?.addEventListener('click', resetSettingsHandler);

    // Validate Timer Inputs
    document.querySelectorAll('.setting-group input[type="number"]').forEach(input => {
        input.addEventListener('input', validateTimerInput);
    });

    function startTimer() {
        if (isRunning && !isPaused) return;
        isRunning = true;
        isPaused = false;
        toggleButtonState(true);
        timer = setInterval(timerCountdown, 1000);
        
        // Play start sound when starting a break
        if (isBreak) {
            const startSound = document.getElementById('startSound');
            startSound.currentTime = 0;
            startSound.play();
        }
    }

    function stopOrResumeTimer() {
        if (!isRunning) return;
        if (!isPaused) {
            clearInterval(timer);
            isPaused = true;
            toggleButtonState(false, true);
        } else {
            isPaused = false;
            toggleButtonState(true);
            timer = setInterval(timerCountdown, 1000);
        }
    }

    function restartTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        minutes = modes[currentMode];
        seconds = 0;
        updateDisplay();
        toggleButtonState(false);     
    }

    function timerCountdown() {
        if (seconds === 0) {
            if (minutes === 0) {
                clearInterval(timer);
                handleTimerEnd();
                return;
            }
            minutes--;
            seconds = 59;
        } else {
            seconds--;
        }
        updateDisplay();
    }

    function handleTimerEnd() {
        isRunning = false;
        toggleButtonState(false);
        
        // Play end sound
        const endSound = document.getElementById('endSound');
        endSound.currentTime = 0;
        endSound.play();
        
        if (!isBreak) {
            updateStats(modes.pomodoro);
            completedPomodoros++;
            isBreak = true;
            setMode(completedPomodoros % 4 === 0 ? 'longBreak' : 'shortBreak');
        } else {
            isBreak = false;
            setMode('pomodoro');
        }
        setTimeout(startTimer, 1000);
    }

    function setMode(mode) {
        document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode).classList.add('active');
        currentMode = mode;
        minutes = modes[mode];
        seconds = 0;
        updateDisplay();
        if (isRunning) clearInterval(timer);
        isRunning = false;
        isPaused = false;
        toggleButtonState(false);
    }

    function updateDisplay() {
        minutesElement.textContent = String(minutes).padStart(2, '0');
        secondsElement.textContent = String(seconds).padStart(2, '0');
    }

    function toggleButtonState(started, paused = false) {
        watchDisplay.classList.toggle('active', started);
        startButton.disabled = started;
        stopButton.disabled = !started;
        stopButton.innerHTML = paused ? '<i class="fas fa-play"></i> Resume' : '<i class="fas fa-pause"></i> Pause';
    }

    // ===== Settings Functions =====

    function toggleSettingsPanel() {
        settingsPanel.classList.toggle('active');
        overlay.classList.toggle('active');
        if (settingsPanel.classList.contains('active')) updateSettingsInputs();
    }

    function closeSettingsPanel() {
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
    }

    function saveSettingsHandler() {
        const inputs = getTimerInputs();
        if (inputs) {
            pomodoroTime = clamp(inputs.pomodoroTime, 1, 60);
            shortBreakTime = clamp(inputs.shortBreakTime, 1, 30);
            longBreakTime = clamp(inputs.longBreakTime, 1, 60);
            saveSettings();
            updateSettingsInputs();
            updateTimerDisplay();
            showTemporaryNotification();
        }
    }

    function resetSettingsHandler() {
        pomodoroTime = 25;
        shortBreakTime = 5;
        longBreakTime = 15;
        saveSettings();
        updateSettingsInputs();
        updateTimerDisplay();
        showTemporaryNotification();
    }

    function saveSettings() {
        localStorage.setItem('pomodoroTime', pomodoroTime);
        localStorage.setItem('shortBreakTime', shortBreakTime);
        localStorage.setItem('longBreakTime', longBreakTime);
        modes = { pomodoro: pomodoroTime, shortBreak: shortBreakTime, longBreak: longBreakTime };
    }

    function loadSettings() {
        pomodoroTime = parseInt(localStorage.getItem('pomodoroTime')) || pomodoroTime;
        shortBreakTime = parseInt(localStorage.getItem('shortBreakTime')) || shortBreakTime;
        longBreakTime = parseInt(localStorage.getItem('longBreakTime')) || longBreakTime;
        modes = { pomodoro: pomodoroTime, shortBreak: shortBreakTime, longBreak: longBreakTime };
        updateTimerDisplay();
    }

    function updateTimerDisplay() {
        if (document.querySelector('.mode-buttons button.active')) {
            const mode = document.querySelector('.mode-buttons button.active').id;
            minutes = modes[mode];
            seconds = 0;
            updateDisplay();
        }
    }

    function updateSettingsInputs() {
        const { pomodoroTime: p, shortBreakTime: s, longBreakTime: l } = getTimerInputs() || {};
        if (p !== undefined && s !== undefined && l !== undefined) {
            document.getElementById('pomodoroTime').value = pomodoroTime;
            document.getElementById('shortBreakTime').value = shortBreakTime;
            document.getElementById('longBreakTime').value = longBreakTime;
        }
    }

    function getTimerInputs() {
        return {
            pomodoroTime: parseInt(document.getElementById('pomodoroTime')?.value),
            shortBreakTime: parseInt(document.getElementById('shortBreakTime')?.value),
            longBreakTime: parseInt(document.getElementById('longBreakTime')?.value),
        };
    }

    function validateTimerInput(e) {
        let value = parseInt(e.target.value);
        const max = e.target.id === 'shortBreakTime' ? 30 : 60;
        e.target.value = isNaN(value) ? '' : clamp(value, 1, max);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function showTemporaryNotification() {
        const notification = document.getElementById('settingsNotification');
        if (notification) {
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
    }

    // ===== Task Management =====

    function addTask() {
        const taskText = taskInput.value.trim();
        const pomodoros = parseInt(pomodoroEstimate.value) || 1;
        if (!taskText || taskList.children.length >= 4) return;

        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-checkbox"></div>
            <div class="task-content">
                <span class="task-text">${taskText}</span>
                <span class="task-pomodoros">${pomodoros} pomodoro${pomodoros > 1 ? 's' : ''}</span>
            </div>
        `;

        taskItem.querySelector('.task-checkbox').addEventListener('click', (e) => {
            e.stopPropagation();
            completeTask(taskItem);
        });

        taskItem.addEventListener('click', () => setPriorityTask(taskItem, taskText));
        taskList.appendChild(taskItem);
        taskInput.value = '';
        pomodoroEstimate.value = '';
    }

    function completeTask(taskItem) {
        taskItem.querySelector('.task-checkbox').classList.toggle('checked');
        taskItem.classList.toggle('completed');
        if (taskItem.classList.contains('completed')) {
            triggerConfetti();
            showNotification();
            setTimeout(() => {
                taskItem.style.opacity = '0';
                setTimeout(() => taskItem.remove(), 300);
                if (taskItem.classList.contains('priority')) resetPriorityTask();
            }, 500);
        }
    }

    function setPriorityTask(taskItem, taskText) {
        document.querySelectorAll('.task-item').forEach(t => t.classList.remove('priority'));
        taskItem.classList.add('priority');
        priorityTask.innerHTML = `<div class="priority-content"><span class="priority-text"># ${taskText}</span></div>`;
        priorityTask.classList.add('active');
    }

    function resetPriorityTask() {
        priorityTask.innerHTML = `<div class="priority-placeholder"><i class="fas fa-flag"></i><span>Select a task to focus on</span></div>`;
        priorityTask.classList.remove('active');
    }

    // ===== Stats Update =====

    function updateStats(completedMinutes) {
        const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || { dailyStats: {}, currentStreak: 0, longestStreak: 0, lastStudyDate: null };
        const today = new Date().toLocaleDateString();

        stats.dailyStats[today] ||= { totalMinutes: 0, completedPomodoros: 0 };
        stats.dailyStats[today].totalMinutes += completedMinutes;
        stats.dailyStats[today].completedPomodoros += 1;

        const lastDate = new Date(stats.lastStudyDate);
        const dayDiff = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        stats.currentStreak = dayDiff === 1 ? stats.currentStreak + 1 : dayDiff > 1 ? 1 : stats.currentStreak;
        stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
        stats.lastStudyDate = new Date().toISOString();

        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    // ===== Notification / Confetti =====

    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 3000);
    }

    function triggerConfetti() {
        const duration = 3 * 1000, animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount: 50 * (timeLeft / duration), origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }
});
