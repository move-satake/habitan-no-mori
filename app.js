// Habitan no Mori - Compassionate Habit Tracker
class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habitanHabits')) || [];
        this.completions = JSON.parse(localStorage.getItem('habitanCompletions')) || {};
        this.encouragementMessages = [
            "Every small step counts. You're doing great! 💪",
            "Progress, not perfection. Keep going! 🌟",
            "You're building something beautiful, one day at a time. 🌱",
            "It's okay to take breaks. You're still amazing! 🤗",
            "Your future self will thank you for today's efforts. ✨",
            "Small wins lead to big changes. Celebrate today! 🎉",
            "You showed up today, and that's what matters. 💚",
            "Every habit is a vote for the person you want to become. 🗳️",
            "Consistency beats perfection every time. Keep it up! 🎯",
            "You're not behind - you're exactly where you need to be. 🦋"
        ];
        
        this.init();
    }

    init() {
        this.updateDate();
        this.renderHabits();
        this.updateStats();
        this.showEncouragement();
        this.setupEventListeners();
        
        // Update encouragement message every 30 seconds
        setInterval(() => this.showEncouragement(), 30000);
    }

    setupEventListeners() {
        const habitInput = document.getElementById('habitInput');
        const addHabitBtn = document.getElementById('addHabitBtn');

        addHabitBtn.addEventListener('click', () => this.addHabit());
        habitInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addHabit();
            }
        });
    }

    updateDate() {
        const currentDate = document.getElementById('currentDate');
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDate.textContent = today.toLocaleDateString('en-US', options);
    }

    addHabit() {
        const habitInput = document.getElementById('habitInput');
        const habitName = habitInput.value.trim();

        if (habitName === '') {
            this.showMessage('Please enter a habit name', 'error');
            return;
        }

        if (this.habits.some(habit => habit.name.toLowerCase() === habitName.toLowerCase())) {
            this.showMessage('This habit already exists', 'warning');
            return;
        }

        const newHabit = {
            id: Date.now(),
            name: habitName,
            createdAt: new Date().toISOString().split('T')[0]
        };

        this.habits.push(newHabit);
        this.saveData();
        
        habitInput.value = '';
        this.renderHabits();
        this.updateStats();
        
        this.showMessage('Habit added successfully! 🎉', 'success');
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
            this.habits = this.habits.filter(habit => habit.id !== habitId);
            
            // Clean up completions for this habit
            Object.keys(this.completions).forEach(date => {
                if (this.completions[date]) {
                    this.completions[date] = this.completions[date].filter(id => id !== habitId);
                    if (this.completions[date].length === 0) {
                        delete this.completions[date];
                    }
                }
            });
            
            this.saveData();
            this.renderHabits();
            this.updateStats();
            this.showMessage('Habit deleted. Remember, it\'s okay to change course! 💙', 'info');
        }
    }

    toggleHabit(habitId) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.completions[today]) {
            this.completions[today] = [];
        }

        const completionIndex = this.completions[today].indexOf(habitId);
        
        if (completionIndex === -1) {
            // Mark as completed
            this.completions[today].push(habitId);
            this.showMessage('Great job! One step closer to your goals! ⭐', 'success');
        } else {
            // Mark as not completed
            this.completions[today].splice(completionIndex, 1);
            this.showMessage('No worries! Tomorrow is a fresh start! 🌅', 'info');
        }

        this.saveData();
        this.renderHabits();
        this.updateStats();
    }

    isHabitCompleted(habitId) {
        const today = new Date().toISOString().split('T')[0];
        return this.completions[today] && this.completions[today].includes(habitId);
    }

    renderHabits() {
        const habitsList = document.getElementById('habitsList');
        
        if (this.habits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <h3>🌱 Ready to start your journey?</h3>
                    <p>Add your first habit above and take the first step towards a better you!</p>
                </div>
            `;
            return;
        }

        habitsList.innerHTML = this.habits.map(habit => {
            const isCompleted = this.isHabitCompleted(habit.id);
            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                    <div class="habit-content">
                        <div class="habit-check ${isCompleted ? 'checked' : ''}" onclick="habitTracker.toggleHabit(${habit.id})"></div>
                        <span class="habit-name">${this.escapeHtml(habit.name)}</span>
                    </div>
                    <button class="delete-habit" onclick="habitTracker.deleteHabit(${habit.id})">Delete</button>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.completions[today] ? this.completions[today].length : 0;
        
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('totalHabits').textContent = this.habits.length;
    }

    showEncouragement() {
        const encouragementElement = document.getElementById('encouragementMessage');
        const randomMessage = this.encouragementMessages[
            Math.floor(Math.random() * this.encouragementMessages.length)
        ];
        
        encouragementElement.style.opacity = '0';
        setTimeout(() => {
            encouragementElement.textContent = randomMessage;
            encouragementElement.style.opacity = '1';
        }, 300);
    }

    showMessage(message, type = 'info') {
        // Create a temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;

        document.body.appendChild(messageEl);

        // Add CSS animation if not already added
        if (!document.getElementById('messageStyles')) {
            const style = document.createElement('style');
            style.id = 'messageStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove message after 3 seconds
        setTimeout(() => {
            messageEl.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    getMessageColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#667eea'
        };
        return colors[type] || colors.info;
    }

    saveData() {
        localStorage.setItem('habitanHabits', JSON.stringify(this.habits));
        localStorage.setItem('habitanCompletions', JSON.stringify(this.completions));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export data functionality
    exportData() {
        const data = {
            habits: this.habits,
            completions: this.completions,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'habitan-no-mori-backup.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import data functionality
    importData(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.habits && data.completions) {
                    this.habits = data.habits;
                    this.completions = data.completions;
                    this.saveData();
                    this.renderHabits();
                    this.updateStats();
                    this.showMessage('Data imported successfully! 🎉', 'success');
                } else {
                    this.showMessage('Invalid file format', 'error');
                }
            } catch (error) {
                this.showMessage('Error reading file', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.habitTracker = new HabitTracker();
});

// Add some CSS for message animations
const messageStyles = `
    .message {
        transition: opacity 0.3s ease;
    }
`;

// Add the styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = messageStyles;
document.head.appendChild(styleElement);