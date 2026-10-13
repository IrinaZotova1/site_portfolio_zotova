// Блок бургер-меню
const burger = document.getElementById('burgerBtn');
const mainNav = document.getElementById('mainNav');
burger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
    });
});

// Блок hero
window.addEventListener('load', () => {
    document.querySelectorAll('.hero-display .word').forEach((word, i) => {
        setTimeout(() => word.classList.add('visible'), i * 100);
    });
    setTimeout(() => document.getElementById('heroAvatar').classList.add('visible'), 900);
});

// Блок скрытие хедера
let lastScrollY = window.scrollY;
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastScrollY && y > 300) header.classList.add('hidden');
    else header.classList.remove('hidden');
    lastScrollY = y;
}, { passive: true });

// Блок intersection observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.fade-up, .reveal-line').forEach(el => observer.observe(el));

// Блок курсор-превью
const preview = document.getElementById('cursorPreview');
const projects = document.querySelectorAll('#portfolio .project');
const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (hasHover) {
    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;
        preview.style.left = currentX + 'px';
        preview.style.top = currentY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    projects.forEach(p => {
        p.addEventListener('mouseenter', () => {
            preview.style.backgroundImage = `url(${p.dataset.image})`;
            preview.setAttribute('data-label', p.dataset.label || '');
            preview.classList.add('active');
        });
        p.addEventListener('mouseleave', () => preview.classList.remove('active'));
    });
}

// Блок параллакс
const shapes = document.querySelectorAll('.shape');
let ticking = false;
function updateParallax() {
    const scrollY = window.scrollY;
    shapes.forEach(shape => {
        const speed = parseFloat(shape.dataset.speed || 0.2);
        shape.style.transform = `translateY(${-scrollY * speed}px) rotate(${scrollY * speed * 0.05}deg)`;
    });
    ticking = false;
}
window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
    }
}, { passive: true });

// Блок закрытие папок
document.addEventListener('click', function(e) {
    document.querySelectorAll('.folder-card.flipped').forEach(card => {
        if (!card.contains(e.target)) card.classList.remove('flipped');
    });
});

// Блок рисование
const canvas = document.getElementById('drawCanvas');
const drawArea = document.getElementById('drawArea');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

let isDrawing = false;
let lastX = 0, lastY = 0;
let currentColor = '#cc0000';
let hasDrawn = false;

function resizeCanvas() {
    const rect = drawArea.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const imageData = hasDrawn ? ctx.getImageData(0, 0, canvas.width, canvas.height) : null;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2.5;
    if (imageData) {
        ctx.putImageData(imageData, 0, 0);
    }
}

window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(resizeCanvas, 150);
});
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 300);
});

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const { x, y } = getCoords(e);
    lastX = x;
    lastY = y;
    if (!hasDrawn) {
        hasDrawn = true;
        drawArea.classList.add('drawn');
    }
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();
}

function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
}

function stopDraw() { isDrawing = false; }

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', stopDraw);
canvas.addEventListener('touchcancel', stopDraw);

clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
    drawArea.classList.remove('drawn');
});

// Блок модальное окно
const ctaModal = document.getElementById('ctaModal');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const modalSecondary = document.getElementById('modalSecondary');
const modalPrimary = document.getElementById('modalPrimary');
const processSection = document.getElementById('process');

let modalShown = false;
let modalDismissed = false;

function showModal() {
    if (modalShown || modalDismissed) return;
    modalShown = true;
    ctaModal.classList.add('active');
    document.body.classList.add('no-scroll');
}

function hideModal() {
    ctaModal.classList.remove('active');
    document.body.classList.remove('no-scroll');
    modalDismissed = true;
}

window.addEventListener('scroll', () => {
    if (modalShown || modalDismissed) return;
    const rect = processSection.getBoundingClientRect();
    if (rect.bottom < window.innerHeight * 0.4) showModal();
}, { passive: true });

modalClose.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', hideModal);
modalSecondary.addEventListener('click', hideModal);
modalPrimary.addEventListener('click', hideModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ctaModal.classList.contains('active')) hideModal();
});// JavaScript Document