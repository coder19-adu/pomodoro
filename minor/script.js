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
    
    // Load timer settings
    const timerSettings = JSON.parse(localStorage.getItem('timerSettings')) || {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    
    // Timer mode settings
    const modes = {
        pomodoro: timerSettings.pomodoro,
        shortBreak: timerSettings.shortBreak,
        longBreak: timerSettings.longBreak
    };
    
    // Initialize timer display
    updateDisplay();
    
    // Update timer settings when returning from settings page
    window.addEventListener('focus', () => {
        const newSettings = JSON.parse(localStorage.getItem('timerSettings'));
        if (newSettings) {
            modes.pomodoro = newSettings.pomodoro;
            modes.shortBreak = newSettings.shortBreak;
            modes.longBreak = newSettings.longBreak;
            
            // Update current timer if not running
            if (!isRunning) {
                minutes = modes[currentMode];
                seconds = 0;
                updateDisplay();
            }
        }
    });
    
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

    // Listen for settings changes
    window.addEventListener('storage', (e) => {
        if (e.key === 'timerSettings') {
            const newSettings = JSON.parse(e.newValue);
            modes.pomodoro = newSettings.pomodoro;
            modes.shortBreak = newSettings.shortBreak;
            modes.longBreak = newSettings.longBreak;
            
            // Update current timer if not running
            if (!isRunning) {
                const activeMode = document.querySelector('.mode-buttons button.active').id;
                minutes = modes[activeMode];
                seconds = 0;
                updateDisplay();
            }
        }
    });
    
    function setMode(mode) {
        // Remove active class from all buttons
        pomodoroButton.classList.remove('active');
        shortBreakButton.classList.remove('active');
        longBreakButton.classList.remove('active');
        
        // Add active class to selected button
        document.getElementById(mode).classList.add('active');
        
        // Set timer values
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
                        
                        // Play notification sound
                        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
                        
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
                            
                            // Play notification sound
                            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3').play();
                            
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
}); 
