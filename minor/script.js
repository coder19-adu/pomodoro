document.addEventListener('DOMContentLoaded', () => {
    // Timer elements
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const restartButton = document.getElementById('restart');
    const watchDisplay = document.querySelector('.watch-display');
    
    // Mode buttons
    const pomodoroButton = document.getElementById('pomodoro');
    const shortBreakButton = document.getElementById('shortBreak');
    const longBreakButton = document.getElementById('longBreak');
    
    // Task elements
    const taskInput = document.getElementById('taskInput');
    const pomodoroEstimate = document.getElementById('pomodoroEstimate');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const notification = document.getElementById('notification');
    const priorityTask = document.getElementById('priorityTask');
    
    // Timer variables
    let timer;
    let minutes = 25;
    let seconds = 0;
    let isRunning = false;
    let isPaused = false;
    let completedPomodoros = 0;
    let isBreak = false;
    let currentMode = 'pomodoro';
    
    // Timer Settings
    let pomodoroTime = 25;
    let shortBreakTime = 5;
    let longBreakTime = 15;
    
    // Timer mode settings
    let modes = {
        pomodoro: pomodoroTime,
        shortBreak: shortBreakTime,
        longBreak: longBreakTime
    };

    // Load settings immediately when the page loads
    loadSettings();

    // Initialize timer display
    updateDisplay();
    
    // Event Listeners for mode buttons
    pomodoroButton.addEventListener('click', () => setMode('pomodoro'));
    shortBreakButton.addEventListener('click', () => setMode('shortBreak'));
    longBreakButton.addEventListener('click', () => setMode('longBreak'));
    
    // Control buttons
    startButton.addEventListener('click', startTimer);
    stopButton.addEventListener('click', stopTimer);
    restartButton.addEventListener('click', restartTimer);
    
    // Task functionality
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Settings elements
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsBtn = document.getElementById('closeSettings');
    const overlay = document.getElementById('overlay');

    // Settings panel functionality
    settingsBtn.addEventListener('click', () => {
        if (settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            settingsPanel.classList.add('active');
            overlay.classList.add('active');
            loadSettings();
            updateSettingsInputs();
        }
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
    });

    // Close settings panel when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // Close panel when clicking overlay
    overlay.addEventListener('click', () => {
        if (settingsPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
        }
        overlay.classList.remove('active');
    });

    function updateSettingsInputs() {
        const pomodoroInput = document.getElementById('pomodoroTime');
        const shortBreakInput = document.getElementById('shortBreakTime');
        const longBreakInput = document.getElementById('longBreakTime');

        if (pomodoroInput && shortBreakInput && longBreakInput) {
            pomodoroInput.value = pomodoroTime;
            shortBreakInput.value = shortBreakTime;
            longBreakInput.value = longBreakTime;
        }
    }

    // Save settings
    const saveSettingsBtn = document.getElementById('saveSettings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const pomodoroInput = document.getElementById('pomodoroTime');
            const shortBreakInput = document.getElementById('shortBreakTime');
            const longBreakInput = document.getElementById('longBreakTime');

            if (pomodoroInput && shortBreakInput && longBreakInput) {
                // Get values and ensure they are numbers
                const newPomodoroTime = parseInt(pomodoroInput.value);
                const newShortBreakTime = parseInt(shortBreakInput.value);
                const newLongBreakTime = parseInt(longBreakInput.value);

                // Only update if values are valid numbers
                if (!isNaN(newPomodoroTime) && !isNaN(newShortBreakTime) && !isNaN(newLongBreakTime)) {
                    pomodoroTime = Math.max(1, Math.min(60, newPomodoroTime));
                    shortBreakTime = Math.max(1, Math.min(30, newShortBreakTime));
                    longBreakTime = Math.max(1, Math.min(60, newLongBreakTime));

                    // Update the inputs with validated values
                    pomodoroInput.value = pomodoroTime;
                    shortBreakInput.value = shortBreakTime;
                    longBreakInput.value = longBreakTime;

                    saveSettings();
                    updateTimerDisplay();
                    
                    // Show notification
                    const notification = document.getElementById('settingsNotification');
                    if (notification) {
                        notification.style.display = 'block';
                        setTimeout(() => {
                            notification.style.display = 'none';
                        }, 3000);
                    }
                }
            }
        });
    }

    // Reset settings
    const resetSettingsBtn = document.getElementById('resetSettings');
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            resetSettings();
            updateSettingsInputs();
            
            // Show notification
            const notification = document.getElementById('settingsNotification');
            if (notification) {
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Add input validation
    const timerInputs = document.querySelectorAll('.setting-group input[type="number"]');
    timerInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) {
                value = '';
            } else {
                // Ensure value is within range
                const max = input.id === 'shortBreakTime' ? 30 : 60;
                value = Math.max(1, Math.min(max, value));
            }
            e.target.value = value;
        });
    });

    function setMode(mode) {
        // Remove active class from all buttons
        pomodoroButton.classList.remove('active');
        shortBreakButton.classList.remove('active');
        longBreakButton.classList.remove('active');
        
        // Add active class to selected button
        document.getElementById(mode).classList.add('active');
        
        // Set timer values based on current settings
        minutes = modes[mode];
        seconds = 0;
        updateDisplay();
        
        // Stop timer if running
        if (isRunning) {
            stopTimer();
        }
    }
    
    function startTimer() {
        if (!isRunning || isPaused) {
            isRunning = true;
            isPaused = false;
            watchDisplay.classList.add('active');
            startButton.disabled = true;
            stopButton.disabled = false;
            stopButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            timer = setInterval(() => {
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(timer);
                        isRunning = false;
                        watchDisplay.classList.remove('active');
                        startButton.disabled = false;
                        stopButton.disabled = true;
                        
                        // Update statistics when a pomodoro is completed
                        if (!isBreak) {
                            updateStats(modes.pomodoro);
                        }
                        
                        // Handle automatic breaks
                        if (!isBreak) {
                            completedPomodoros++;
                            if (completedPomodoros % 4 === 0) {
                                // Long break after 4 pomodoros
                                setMode('longBreak');
                            } else {
                                // Short break after each pomodoro
                                setMode('shortBreak');
                            }
                            isBreak = true;
                        } else {
                            // Return to pomodoro after break
                            setMode('pomodoro');
                            isBreak = false;
                        }
                        
                        // Auto start the next timer
                        setTimeout(() => {
                            startTimer();
                        }, 1000);
                        
                        return;
                    }
                    minutes--;
                    seconds = 59;
                } else {
                    seconds--;
                }
                updateDisplay();
            }, 1000);
        }
    }
    
    function stopTimer() {
        if (isRunning) {
            if (!isPaused) {
                // Pause the timer
                clearInterval(timer);
                isPaused = true;
                stopButton.innerHTML = '<i class="fas fa-play"></i> Resume';
                watchDisplay.classList.remove('active');
            } else {
                // Resume the timer
                isPaused = false;
                stopButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
                watchDisplay.classList.add('active');
                timer = setInterval(() => {
                    if (seconds === 0) {
                        if (minutes === 0) {
                            clearInterval(timer);
                            isRunning = false;
                            watchDisplay.classList.remove('active');
                            startButton.disabled = false;
                            stopButton.disabled = true;
                            
                            // Handle automatic breaks
                            if (!isBreak) {
                                completedPomodoros++;
                                if (completedPomodoros % 4 === 0) {
                                    // Long break after 4 pomodoros
                                    setMode('longBreak');
                                } else {
                                    // Short break after each pomodoro
                                    setMode('shortBreak');
                                }
                                isBreak = true;
                            } else {
                                // Return to pomodoro after break
                                setMode('pomodoro');
                                isBreak = false;
                            }
                            
                            // Auto start the next timer
                            setTimeout(() => {
                                startTimer();
                            }, 1000);
                            
                            return;
                        }
                        minutes--;
                        seconds = 59;
                    } else {
                        seconds--;
                    }
                    updateDisplay();
                }, 1000);
            }
        }
    }
    
    function restartTimer() {
        clearInterval(timer);
        isRunning = false;
        isPaused = false;
        const activeMode = document.querySelector('.mode-buttons button.active').id;
        minutes = modes[activeMode];
        seconds = 0;
        updateDisplay();
        startButton.disabled = false;
        stopButton.disabled = true;
        stopButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        watchDisplay.classList.remove('active');
    }
    
    function updateDisplay() {
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    function showNotification() {
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    function triggerConfetti() {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    }

    function updatePriorityTask(taskText) {
        const priorityTask = document.getElementById('priorityTask');
        priorityTask.innerHTML = `
            <div class="priority-content">
                <span class="priority-text"># ${taskText}</span>
            </div>
        `;
        priorityTask.classList.add('active');
    }

    function resetPriorityTask() {
        priorityTask.innerHTML = `
            <div class="priority-placeholder">
                <i class="fas fa-flag"></i>
                <span>Select a task to focus on</span>
            </div>
        `;
        priorityTask.classList.remove('active');
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const pomodoros = parseInt(pomodoroEstimate.value) || 1;
        
        if (taskText && taskList.children.length < 4) {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            
            const checkbox = document.createElement('div');
            checkbox.className = 'task-checkbox';
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                checkbox.classList.toggle('checked');
                taskItem.classList.toggle('completed');
                if (checkbox.classList.contains('checked')) {
                    triggerConfetti();
                    showNotification();
                    setTimeout(() => {
                        taskItem.style.opacity = '0';
                        setTimeout(() => {
                            taskItem.remove();
                            if (taskItem.classList.contains('priority')) {
                                resetPriorityTask();
                            }
                        }, 300);
                    }, 500);
                }
            });
            
            const content = document.createElement('div');
            content.className = 'task-content';
            
            const text = document.createElement('span');
            text.className = 'task-text';
            text.textContent = taskText;
            
            const pomodoroBadge = document.createElement('span');
            pomodoroBadge.className = 'task-pomodoros';
            pomodoroBadge.textContent = `${pomodoros} pomodoro${pomodoros > 1 ? 's' : ''}`;
            
            content.appendChild(text);
            content.appendChild(pomodoroBadge);
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(content);
            
            // Add click event to set as priority task
            taskItem.addEventListener('click', () => {
                // Remove priority class from all tasks
                document.querySelectorAll('.task-item').forEach(task => {
                    task.classList.remove('priority');
                });
                
                // Add priority class to clicked task
                taskItem.classList.add('priority');
                
                // Update priority task display with just the task name
                updatePriorityTask(taskText);
            });
            
            taskList.appendChild(taskItem);
            
            // Clear inputs
            taskInput.value = '';
            pomodoroEstimate.value = '';
        }
    }

    function updateStats(completedMinutes) {
        // Get current stats
        const stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {
            dailyStats: {},
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null
        };

        const today = new Date().toLocaleDateString();
        
        // Initialize today's stats if they don't exist
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = {
                totalMinutes: 0,
                completedPomodoros: 0
            };
        }
        
        // Update today's stats
        stats.dailyStats[today].totalMinutes += completedMinutes;
        stats.dailyStats[today].completedPomodoros += 1;
        
        // Update streak
        if (stats.lastStudyDate) {
            const lastDate = new Date(stats.lastStudyDate);
            const currentDate = new Date();
            const dayDifference = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (dayDifference === 0) {
                // Same day, streak continues
            } else if (dayDifference === 1) {
                // Next day, increment streak
                stats.currentStreak += 1;
                stats.longestStreak = Math.max(stats.currentStreak, stats.longestStreak);
            } else {
                // Streak broken
                stats.currentStreak = 1;
            }
        } else {
            // First time studying
            stats.currentStreak = 1;
            stats.longestStreak = 1;
        }
        
        // Update last study date
        stats.lastStudyDate = new Date().toISOString();
        
        // Save updated stats
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }

    // Load settings from localStorage
    function loadSettings() {
        const savedPomodoroTime = localStorage.getItem('pomodoroTime');
        const savedShortBreakTime = localStorage.getItem('shortBreakTime');
        const savedLongBreakTime = localStorage.getItem('longBreakTime');

        if (savedPomodoroTime) pomodoroTime = parseInt(savedPomodoroTime);
        if (savedShortBreakTime) shortBreakTime = parseInt(savedShortBreakTime);
        if (savedLongBreakTime) longBreakTime = parseInt(savedLongBreakTime);

        // Update modes with loaded settings
        modes = {
            pomodoro: pomodoroTime,
            shortBreak: shortBreakTime,
            longBreak: longBreakTime
        };

        // Update the timer display if we're on the main page
        if (!window.location.pathname.includes('settings.html')) {
            updateTimerDisplay();
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('pomodoroTime', pomodoroTime);
        localStorage.setItem('shortBreakTime', shortBreakTime);
        localStorage.setItem('longBreakTime', longBreakTime);
        
        // Update modes with new settings
        modes = {
            pomodoro: pomodoroTime,
            shortBreak: shortBreakTime,
            longBreak: longBreakTime
        };
    }

    // Reset settings to default
    function resetSettings() {
        pomodoroTime = 25;
        shortBreakTime = 5;
        longBreakTime = 15;
        saveSettings();
        
        // Update the timer display if we're on the main page
        if (!window.location.pathname.includes('settings.html')) {
            updateTimerDisplay();
        }
    }

    function updateTimerDisplay() {
        const activeMode = document.querySelector('.mode-buttons button.active');
        if (activeMode) {
            const mode = activeMode.id;
            minutes = modes[mode];
            seconds = 0;
            updateDisplay();
        }
    }
}); 