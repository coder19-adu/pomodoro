document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const pomodoroInput = document.getElementById('pomodoroTime');
    const shortBreakInput = document.getElementById('shortBreakTime');
    const longBreakInput = document.getElementById('longBreakTime');
    const saveButton = document.getElementById('saveSettings');

    // Load saved settings
    loadSettings();

    // Save settings when button is clicked
    saveButton.addEventListener('click', saveSettings);

    function loadSettings() {
        // Get saved settings from localStorage
        const savedSettings = JSON.parse(localStorage.getItem('timerSettings')) || {
            pomodoro: 25,
            shortBreak: 5,
            longBreak: 15
        };

        // Set input values
        pomodoroInput.value = savedSettings.pomodoro;
        shortBreakInput.value = savedSettings.shortBreak;
        longBreakInput.value = savedSettings.longBreak;
    }

    function saveSettings() {
        // Get values from inputs
        const settings = {
            pomodoro: parseInt(pomodoroInput.value),
            shortBreak: parseInt(shortBreakInput.value),
            longBreak: parseInt(longBreakInput.value)
        };

        // Validate inputs
        if (isNaN(settings.pomodoro) || settings.pomodoro < 1 || settings.pomodoro > 60) {
            alert('Pomodoro duration must be between 1 and 60 minutes');
            return;
        }
        if (isNaN(settings.shortBreak) || settings.shortBreak < 1 || settings.shortBreak > 30) {
            alert('Short break duration must be between 1 and 30 minutes');
            return;
        }
        if (isNaN(settings.longBreak) || settings.longBreak < 1 || settings.longBreak > 60) {
            alert('Long break duration must be between 1 and 60 minutes');
            return;
        }

        // Save to localStorage
        localStorage.setItem('timerSettings', JSON.stringify(settings));

        // Show success message
        alert('Settings saved successfully!');
    }
}); 