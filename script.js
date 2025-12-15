// Mobile Menu Toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards, steps, and pricing cards
document.querySelectorAll('.feature-card, .step, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
});

// Counter Animation for Stats
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);
    
    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };
    
    updateCounter();
};

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            const targetValue = parseInt(statNumber.textContent);
            animateCounter(statNumber, targetValue);
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
});

// Button Click Effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple effect styles dynamically
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @media (max-width: 968px) {
        .nav-menu.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
    }
`;
document.head.appendChild(style);

// Form Validation (if forms are added later)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Language Switcher
const languageSwitcher = document.getElementById('languageSwitcher');
let currentLang = localStorage.getItem('preferredLanguage') || 'fr';

if (languageSwitcher) {
    languageSwitcher.addEventListener('click', () => {
        currentLang = currentLang === 'fr' ? 'en' : 'fr';
        changeLanguage(currentLang);
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
});

// Chat Widget
const chatButton = document.getElementById('chatButton');
const chatWidget = document.getElementById('chatWidget');
const chatClose = document.getElementById('chatClose');
const chatForm = document.getElementById('chatForm');
const chatSuccess = document.getElementById('chatSuccess');

if (chatButton && chatWidget) {
    // Toggle chat widget
    chatButton.addEventListener('click', () => {
        chatWidget.classList.toggle('active');
        chatButton.classList.toggle('active');
    });
    
    // Close chat
    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatWidget.classList.remove('active');
            chatButton.classList.remove('active');
        });
    }
    
    // Close chat when clicking outside
    document.addEventListener('click', (e) => {
        if (!chatWidget.contains(e.target) && !chatButton.contains(e.target)) {
            chatWidget.classList.remove('active');
            chatButton.classList.remove('active');
        }
    });
}

// Chatbot responses
const botResponses = {
    fr: {
        greeting: ["Bonjour ! Comment puis-je vous aider ?", "Salut ! En quoi puis-je vous être utile ?"],
        help: ["Je peux vous aider avec des informations sur Komercia, nos tarifs, ou répondre à vos questions."],
        pricing: ["Nous avons 3 plans : Gratuit (0 Ar), Pro (25,000 Ar/mois) et Entreprise (sur mesure). Lequel vous intéresse ?"],
        features: ["Komercia offre : boutique en ligne, paiements Mobile Money, géolocalisation, gestion des stocks, IA et mode offline."],
        contact: ["Vous pouvez nous contacter via ce chat ou par email. Quelle est votre question ?"],
        default: ["Merci pour votre message ! Un membre de notre équipe vous répondra bientôt.", "Intéressant ! Pouvez-vous m'en dire plus ?", "Je note votre remarque. Autre chose ?"]
    },
    en: {
        greeting: ["Hello! How can I help you?", "Hi! What can I do for you?"],
        help: ["I can help you with information about Komercia, our pricing, or answer your questions."],
        pricing: ["We have 3 plans: Free (0 Ar), Pro (25,000 Ar/month) and Enterprise (custom). Which one interests you?"],
        features: ["Komercia offers: online store, Mobile Money payments, geolocation, inventory management, AI and offline mode."],
        contact: ["You can contact us via this chat or by email. What's your question?"],
        default: ["Thank you for your message! A team member will respond soon.", "Interesting! Can you tell me more?", "I note your feedback. Anything else?"]
    }
};

// Get bot response based on message
function getBotResponse(message, lang = 'fr') {
    const lowerMessage = message.toLowerCase();
    const responses = botResponses[lang];
    
    if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('price') || lowerMessage.includes('pricing')) {
        return responses.pricing[0];
    } else if (lowerMessage.includes('fonctionnalité') || lowerMessage.includes('feature') || lowerMessage.includes('service')) {
        return responses.features[0];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('téléphone')) {
        return responses.contact[0];
    } else if (lowerMessage.includes('aide') || lowerMessage.includes('help') || lowerMessage.includes('?')) {
        return responses.help[0];
    } else {
        return responses.default[Math.floor(Math.random() * responses.default.length)];
    }
}

// Add message to chat
function addMessage(text, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    messageDiv.innerHTML = `
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle chat form submission
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            addMessage(message, true);
            
            // Clear input
            chatInput.value = '';
            
            // Get current language
            const currentLang = localStorage.getItem('preferredLanguage') || 'fr';
            
            // Simulate bot typing and response
            setTimeout(() => {
                const response = getBotResponse(message, currentLang);
                addMessage(response, false);
            }, 500);
        }
    });
}

// Console welcome message
console.log('%c🛍️ Komercia', 'font-size: 24px; font-weight: bold; color: #1E3A8A;');
console.log('%cBienvenue sur la plateforme de digitalisation des commerces à Madagascar!', 'font-size: 14px; color: #3B82F6;');
