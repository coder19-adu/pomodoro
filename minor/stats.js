document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const todayTimeElement = document.getElementById('todayTime');
    const weeklyTimeElement = document.getElementById('weeklyTime');
    const currentStreakElement = document.getElementById('currentStreak');
    const longestStreakElement = document.getElementById('longestStreak');
    const streakDaysElement = document.getElementById('streakDays');

    // Load statistics
    loadStats();
    createCharts();

    function loadStats() {
        const stats = getStats();
        updateDisplayedStats(stats);
    }

    function getStats() {
        return JSON.parse(localStorage.getItem('pomodoroStats')) || {
            dailyStats: {},
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: null
        };
    }

    function updateDisplayedStats(stats) {
        const today = new Date().toLocaleDateString();
        const todayStats = stats.dailyStats[today] || { totalMinutes: 0, completedPomodoros: 0 };
        
        // Update today's time
        const todayHours = Math.floor(todayStats.totalMinutes / 60);
        const todayMinutes = todayStats.totalMinutes % 60;
        todayTimeElement.textContent = `${todayHours}h ${todayMinutes}m`;

        // Calculate and update weekly time
        const weeklyMinutes = calculateWeeklyMinutes(stats.dailyStats);
        const weeklyHours = Math.floor(weeklyMinutes / 60);
        const remainingMinutes = weeklyMinutes % 60;
        weeklyTimeElement.textContent = `${weeklyHours}h ${remainingMinutes}m`;

        // Update streak information
        currentStreakElement.textContent = stats.currentStreak;
        longestStreakElement.textContent = stats.longestStreak;
        updateStreakMessage(stats.currentStreak);
    }

    function calculateWeeklyMinutes(dailyStats) {
        const today = new Date();
        let totalMinutes = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString();
            const dayStats = dailyStats[dateString];
            if (dayStats) {
                totalMinutes += dayStats.totalMinutes;
            }
        }

        return totalMinutes;
    }

    function updateStreakMessage(streak) {
        if (streak === 0) {
            streakDaysElement.textContent = "Start your streak!";
        } else if (streak === 1) {
            streakDaysElement.textContent = "First day! Keep going!";
        } else if (streak <= 3) {
            streakDaysElement.textContent = "Great start!";
        } else if (streak <= 7) {
            streakDaysElement.textContent = "Awesome streak!";
        } else {
            streakDaysElement.textContent = "You're on fire!";
        }
    }

    function createCharts() {
        const stats = getStats();
        createDailyTrendChart(stats);
        createTimeDistributionChart(stats);
        createWeeklyProgressChart(stats);
        createMonthlyOverviewChart(stats);
    }

    function createDailyTrendChart(stats) {
        const ctx = document.getElementById('dailyTrendChart');
        if (!ctx) return;

        const today = new Date();
        const labels = [];
        const data = [];

        // Get data for the last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString();
            const dayStats = stats.dailyStats[dateString] || { totalMinutes: 0 };
            
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            data.push(dayStats.totalMinutes);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Time (minutes)',
                    data: data,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    function createTimeDistributionChart(stats) {
        const ctx = document.getElementById('timeDistributionChart');
        if (!ctx) return;

        const today = new Date();
        const timeSlots = {
            'Morning (6-12)': 0,
            'Afternoon (12-18)': 0,
            'Evening (18-24)': 0,
            'Night (0-6)': 0
        };

        // Calculate time distribution for the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString();
            const dayStats = stats.dailyStats[dateString];
            
            if (dayStats && dayStats.timeSlots) {
                Object.keys(dayStats.timeSlots).forEach(slot => {
                    timeSlots[slot] += dayStats.timeSlots[slot] || 0;
                });
            }
        }

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(timeSlots),
                datasets: [{
                    data: Object.values(timeSlots),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    function createWeeklyProgressChart(stats) {
        const ctx = document.getElementById('weeklyProgressChart');
        if (!ctx) return;

        const today = new Date();
        const labels = [];
        const data = [];

        // Get data for the last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const startDate = new Date(today);
            startDate.setDate(startDate.getDate() - (i * 7));
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            
            const weekTotal = calculateWeekTotal(stats.dailyStats, startDate, endDate);
            
            labels.push(`Week ${4-i}`);
            data.push(weekTotal);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Study Time (minutes)',
                    data: data,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    function createMonthlyOverviewChart(stats) {
        const ctx = document.getElementById('monthlyOverviewChart');
        if (!ctx) return;

        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const labels = [];
        const data = [];

        // Get data for each day of the current month
        for (let date = new Date(firstDay); date <= today; date.setDate(date.getDate() + 1)) {
            const dateString = date.toLocaleDateString();
            const dayStats = stats.dailyStats[dateString] || { totalMinutes: 0 };
            
            labels.push(date.getDate());
            data.push(dayStats.totalMinutes);
        }

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Study Time (minutes)',
                    data: data,
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    }

    function calculateWeekTotal(dailyStats, startDate, endDate) {
        let total = 0;
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateString = date.toLocaleDateString();
            const dayStats = dailyStats[dateString];
            if (dayStats) {
                total += dayStats.totalMinutes;
            }
        }
        return total;
    }
}); 