// Shared state management
const INSS = {
    simulationResults: {},
    appointments: [],
    benefits: [],
    notifications: []
};

// Load stored data
function loadStoredData() {
    const storedAppointments = localStorage.getItem('inssAppointments');
    if (storedAppointments) {
        INSS.appointments = JSON.parse(storedAppointments);
    }
    
    const storedNotifications = localStorage.getItem('inssNotifications');
    if (storedNotifications) {
        INSS.notifications = JSON.parse(storedNotifications);
        updateNotificationBadge();
    }
}

// Benefit Simulation
function simulateRetirement(birthDate, contributionTime, averageSalary) {
    const age = calculateAge(birthDate);
    const minimumAge = 65; // For men
    const minimumContribution = 15;
    
    const remainingYears = Math.max(0, minimumAge - age);
    const isEligible = age >= minimumAge && contributionTime >= minimumContribution;
    
    const estimatedBenefit = calculateBenefit(averageSalary, contributionTime);
    
    return {
        isEligible,
        remainingYears,
        estimatedBenefit,
        contributionTime,
        progress: (contributionTime / minimumContribution) * 100
    };
}

// Appointment Scheduling
function scheduleAppointment(service, location, date, time) {
    const appointment = {
        id: Date.now(),
        service,
        location,
        date,
        time,
        status: 'scheduled'
    };
    
    INSS.appointments.push(appointment);
    localStorage.setItem('inssAppointments', JSON.stringify(INSS.appointments));
    
    // Simulate notification
    addNotification(`Agendamento confirmado para ${service} em ${date} às ${time}`);
    
    return appointment;
}

// Utility Functions
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function calculateBenefit(averageSalary, contributionTime) {
    const baseMultiplier = 0.60 + (contributionTime * 0.02);
    return averageSalary * Math.min(baseMultiplier, 1);
}

function addNotification(message) {
    const notification = {
        id: Date.now(),
        message,
        read: false,
        date: new Date().toISOString()
    };
    
    INSS.notifications.push(notification);
    localStorage.setItem('inssNotifications', JSON.stringify(INSS.notifications));
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const unreadCount = INSS.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Load and inject navbar
async function loadNavbar() {
    try {
        const response = await fetch('/components/navbar.html');
        const html = await response.text();
        
        // Insert navbar after header or at the beginning of body
        const header = document.querySelector('header');
        if (header) {
            header.insertAdjacentHTML('afterend', html);
        } else {
            document.body.insertAdjacentHTML('afterbegin', html);
        }

        // Highlight current page in navbar
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const currentLink = document.querySelector(`.nav-link[href="${currentPage}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadStoredData();
});

// Accessibility Enhancements
function setupAccessibility() {
    // High Contrast Mode
    const toggleHighContrast = () => {
        document.body.classList.toggle('high-contrast');
        localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
    };

    // Font Size Controls
    let fontSize = parseInt(localStorage.getItem('fontSize')) || 100;
    
    const increaseFontSize = () => {
        fontSize = Math.min(fontSize + 10, 150);
        document.body.style.fontSize = `${fontSize}%`;
        localStorage.setItem('fontSize', fontSize);
    };
    
    const decreaseFontSize = () => {
        fontSize = Math.max(fontSize - 10, 70);
        document.body.style.fontSize = `${fontSize}%`;
        localStorage.setItem('fontSize', fontSize);
    };

    // Screen Reader Announcements
    const announce = (message) => {
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    };

    return {
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
        announce
    };
}

// Export functions for use in other files
window.INSS = {
    ...INSS,
    simulateRetirement,
    scheduleAppointment,
    setupAccessibility
}; 