document.addEventListener('DOMContentLoaded', () => {
<<<<<<< HEAD
    console.log('Settings page loaded');
    
    // Get elements
    const settingsForm = document.getElementById('settingsForm');
=======
    // Get elements
>>>>>>> 08927bd5836098e1778a3352474609c7786156bd
    const pomodoroInput = document.getElementById('pomodoroTime');
    const shortBreakInput = document.getElementById('shortBreakTime');
    const longBreakInput = document.getElementById('longBreakTime');
    const saveButton = document.getElementById('saveSettings');

<<<<<<< HEAD
    // Verify elements exist
    if (!settingsForm || !pomodoroInput || !shortBreakInput || !longBreakInput || !saveButton) {
        console.error('Missing required elements:', {
            settingsForm: !!settingsForm,
            pomodoroInput: !!pomodoroInput,
            shortBreakInput: !!shortBreakInput,
            longBreakInput: !!longBreakInput,
            saveButton: !!saveButton
        });
        return;
    }

    // Load saved settings
    loadSettings();

    // Add click event to save button
    saveButton.onclick = function() {
        console.log('Save button clicked');
        saveSettings();
    };

    function loadSettings() {
        console.log('Loading settings...');
        try {
            // Get saved settings from localStorage
            const savedSettings = JSON.parse(localStorage.getItem('timerSettings')) || {
                pomodoro: 25,
                shortBreak: 5,
                longBreak: 15
            };
            console.log('Loaded settings:', savedSettings);

            // Set input values
            pomodoroInput.value = savedSettings.pomodoro;
            shortBreakInput.value = savedSettings.shortBreak;
            longBreakInput.value = savedSettings.longBreak;
        } catch (error) {
            console.error('Error loading settings:', error);
            // Set default values
            pomodoroInput.value = 25;
            shortBreakInput.value = 5;
            longBreakInput.value = 15;
        }
    }

    function saveSettings() {
        console.log('Saving settings...');
        try {
            // Get values from inputs
            const settings = {
                pomodoro: parseInt(pomodoroInput.value),
                shortBreak: parseInt(shortBreakInput.value),
                longBreak: parseInt(longBreakInput.value)
            };
            console.log('Settings to save:', settings);

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
            console.log('Settings saved successfully');

            // Show success message
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error saving settings. Please try again.');
        }
=======
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
>>>>>>> 08927bd5836098e1778a3352474609c7786156bd
    }
}); 