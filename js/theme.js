// ===== ТЕМА: СВЕТЛАЯ / ТЁМНАЯ / КАСТОМНАЯ =====

const DEFAULT_LIGHT = {
    bg: '#e8f0fe',
    card: '#ffffff',
    text: '#1e3a5f',
    sub: '#5a7a9f',
    accent: '#3b6df0',
    green: '#27ae60',
    gold: '#f5a623',
    red: '#e74c3c',
    border: 'rgba(128,128,128,0.15)',
    shadow: 'rgba(59,109,240,0.08)'
};

const DEFAULT_DARK = {
    bg: '#1a2740',
    card: '#1e3050',
    text: '#d0ddf0',
    sub: '#7a9cc0',
    accent: '#3498db',
    green: '#2ecc71',
    gold: '#f39c12',
    red: '#e74c3c',
    border: 'rgba(255,255,255,0.08)',
    shadow: 'rgba(0,0,0,0.3)'
};

let currentTheme = localStorage.getItem('theme_mode') || 'light';
let customColors = JSON.parse(localStorage.getItem('custom_colors') || 'null');

export function initTheme() {
    applyCurrentTheme();
    
    let themeBtn = document.getElementById('themeBtn');
    let randomBtn = document.getElementById('randomThemeBtn');
    
    if (themeBtn) {
        updateThemeIcon(themeBtn);
        themeBtn.onclick = toggleTheme;
    }
    
    if (randomBtn) {
        updateRandomIcon(randomBtn);
        randomBtn.onclick = toggleCustomTheme;
    }
}

function applyCurrentTheme() {
    if (currentTheme === 'custom' && customColors) {
        applyColors(customColors);
        document.body.classList.remove('dark');
    } else if (currentTheme === 'dark') {
        applyColors(DEFAULT_DARK);
        document.body.classList.add('dark');
    } else {
        applyColors(DEFAULT_LIGHT);
        document.body.classList.remove('dark');
    }
}

function toggleTheme() {
    if (currentTheme === 'custom') {
        currentTheme = 'light';
        customColors = null;
        localStorage.removeItem('custom_colors');
    } else if (currentTheme === 'light') {
        currentTheme = 'dark';
    } else {
        currentTheme = 'light';
    }
    
    localStorage.setItem('theme_mode', currentTheme);
    applyCurrentTheme();
    
    let themeBtn = document.getElementById('themeBtn');
    let randomBtn = document.getElementById('randomThemeBtn');
    if (themeBtn) updateThemeIcon(themeBtn);
    if (randomBtn) updateRandomIcon(randomBtn);
}

function toggleCustomTheme() {
    if (currentTheme === 'custom') {
        currentTheme = 'light';
        customColors = null;
        localStorage.removeItem('custom_colors');
    } else {
        currentTheme = 'custom';
        
        let style = Math.floor(Math.random() * 4);
        let h = Math.floor(Math.random() * 360);
        let h2 = (h + 30 + Math.floor(Math.random() * 60)) % 360;
        
        let bgL, cardL, textL, subL;
        
        if (style === 0) {
            bgL = 8 + Math.floor(Math.random() * 15);
            cardL = bgL + 5;
            textL = 85 + Math.floor(Math.random() * 10);
            subL = 55 + Math.floor(Math.random() * 15);
        } else if (style === 1) {
            bgL = 88 + Math.floor(Math.random() * 10);
            cardL = 95 + Math.floor(Math.random() * 5);
            textL = 10 + Math.floor(Math.random() * 15);
            subL = 35 + Math.floor(Math.random() * 15);
        } else if (style === 2) {
            bgL = 80 + Math.floor(Math.random() * 10);
            cardL = 90 + Math.floor(Math.random() * 8);
            textL = 20 + Math.floor(Math.random() * 15);
            subL = 40 + Math.floor(Math.random() * 10);
        } else {
            bgL = 45 + Math.floor(Math.random() * 20);
            cardL = bgL + 10;
            textL = bgL > 55 ? 8 : 90;
            subL = textL === 8 ? 35 : 65;
        }
        
        let s = 20 + Math.floor(Math.random() * 50);
        
        customColors = {
            bg: `hsl(${h}, ${s}%, ${bgL}%)`,
            card: `hsl(${h}, ${s-10}%, ${cardL}%)`,
            text: `hsl(${h}, 15%, ${textL}%)`,
            sub: `hsl(${h}, 10%, ${subL}%)`,
            accent: `hsl(${h2}, 60%, 50%)`,
            green: `hsl(150, 50%, 40%)`,
            gold: `hsl(40, 80%, 50%)`,
            red: `hsl(0, 60%, 50%)`,
            border: `hsl(${h}, 10%, ${bgL > 50 ? bgL-15 : bgL+15}%)`,
            shadow: `hsl(${h}, 10%, ${bgL > 50 ? bgL-20 : bgL-5}%)`,
        };
        localStorage.setItem('custom_colors', JSON.stringify(customColors));
    }
    
    localStorage.setItem('theme_mode', currentTheme);
    applyCurrentTheme();
    
    let themeBtn = document.getElementById('themeBtn');
    let randomBtn = document.getElementById('randomThemeBtn');
    if (themeBtn) updateThemeIcon(themeBtn);
    if (randomBtn) updateRandomIcon(randomBtn);
}

function applyColors(c) {
    let root = document.documentElement;
    root.style.setProperty('--bg', c.bg);
    root.style.setProperty('--card', c.card);
    root.style.setProperty('--text', c.text);
    root.style.setProperty('--sub', c.sub);
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--green', c.green);
    root.style.setProperty('--gold', c.gold);
    root.style.setProperty('--red', c.red);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--shadow', c.shadow);
}

function updateThemeIcon(btn) {
    btn.innerText = currentTheme === 'dark' ? '☀️' : '🌙';
}

function updateRandomIcon(btn) {
    btn.innerText = currentTheme === 'custom' ? '✅' : '🎲';
}