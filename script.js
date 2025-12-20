// Header scroll behavior
let lastScrollTop = 0;
const header = document.getElementById('mainHeader');
let scrollTimeout;

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(function() {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.classList.add('hidden');
        } else {
            // Scrolling up
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;
    }, 10);
}, false);

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// Smooth scroll for anchor links
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

// Color item click functionality on index page
document.addEventListener('DOMContentLoaded', function() {
    const colorItems = document.querySelectorAll('.color-item');
    
    // Color mapping for index page to eiskratzer page
    const colorMap = {
        'Orange': { color: 'orange', image: 'orange.png' },
        'Blau': { color: 'blau', image: 'Blau.png' },
        'Gelb': { color: 'gelb', image: 'gelb.png' },
        'Grau': { color: 'grau', image: 'grau.png' },
        'Grün': { color: 'grün', image: 'grün.png' },
        'Pink': { color: 'pink', image: 'pink.png' },
        'Rot': { color: 'rot', image: 'rot.png' },
        'Schwarz': { color: 'schwarz', image: 'schwarz.png' },
        'Weiß': { color: 'weiß', image: 'weiß.png' }
    };
    
    colorItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const colorName = this.querySelector('p').textContent.trim();
            const colorData = colorMap[colorName];
            
            if (colorData) {
                // Store selected color in localStorage
                localStorage.setItem('selectedColor', colorData.color);
                localStorage.setItem('selectedImage', colorData.image);
                // Redirect to eiskratzer page
                window.location.href = 'eiskratzer.html';
            }
        });
    });
});


