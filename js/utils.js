// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

export function toast(msg) {
    let t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

export function show(id) {
    document.getElementById(id).style.display = 'flex';
}

export function hide(id) {
    document.getElementById(id).style.display = 'none';
}

export function copyPhone(p) {
    navigator.clipboard.writeText(p)
        .then(() => toast('📋 Скопировано'))
        .catch(() => toast('Не удалось скопировать'));
}

export function callPhone(p) {
    window.open('tel:' + p, '_self');
}