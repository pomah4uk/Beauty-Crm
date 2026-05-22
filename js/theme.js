// ===== ТЁМНАЯ ТЕМА =====

let dark = localStorage.getItem('dark') === 'true';

if (dark) {
    document.body.classList.add('dark');
}

export function initTheme() {
    let btn = document.getElementById('themeBtn');
    if (!btn) return;
    
    btn.innerText = dark ? '☀️' : '🌙';
    
    btn.onclick = function() {
        dark = !dark;
        document.body.classList.toggle('dark', dark);
        btn.innerText = dark ? '☀️' : '🌙';
        localStorage.setItem('dark', dark);
    };
}