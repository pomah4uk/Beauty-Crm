// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

export let modalActive = false;
let currentModalResolve = null;

export function toast(msg) {
    let t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}

export function show(id) {
    let el = document.getElementById(id);
    if (el) el.style.display = 'flex';
}

export function hide(id) {
    let el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

export function callPhone(p) {
    window.open('tel:' + p, '_self');
}

export function alertModal(msg) {
    if (modalActive) return;
    modalActive = true;
    
    let msgEl = document.getElementById('alertMessage');
    let modal = document.getElementById('alertModal');
    if (!msgEl || !modal) { modalActive = false; alert(msg); return; }
    
    msgEl.innerText = msg;
    let buttons = document.getElementById('alertButtons');
    buttons.innerHTML = `<button class="btn btn-primary" id="alertOkBtn" style="margin:0">OK</button>`;
    modal.style.display = 'flex';
    
    document.getElementById('alertOkBtn').onclick = function() {
        modal.style.display = 'none';
        modalActive = false;
    };
}

export function confirmModal(msg) {
    return new Promise((resolve) => {
        if (modalActive) { resolve(false); return; }
        modalActive = true;
        currentModalResolve = resolve;
        
        let msgEl = document.getElementById('alertMessage');
        let modal = document.getElementById('alertModal');
        if (!msgEl || !modal) { modalActive = false; currentModalResolve = null; resolve(confirm(msg)); return; }
        
        msgEl.innerText = msg;
        let buttons = document.getElementById('alertButtons');
        buttons.innerHTML = `
            <button class="small-btn" id="alertCancelBtn">Отмена</button>
            <button class="btn btn-primary" id="alertOkBtn" style="margin:0">Да</button>
        `;
        modal.style.display = 'flex';
        
        document.getElementById('alertOkBtn').onclick = function() {
            modal.style.display = 'none';
            modalActive = false;
            currentModalResolve = null;
            resolve(true);
        };
        document.getElementById('alertCancelBtn').onclick = function() {
            modal.style.display = 'none';
            modalActive = false;
            currentModalResolve = null;
            resolve(false);
        };
    });
}

// Закрытие по клику на фон
let alertModalEl = document.getElementById('alertModal');
if (alertModalEl) {
    alertModalEl.addEventListener('click', function(e) {
        if (e.target === this && modalActive) {
            this.style.display = 'none';
            modalActive = false;
            if (currentModalResolve) {
                currentModalResolve(false);
                currentModalResolve = null;
            }
        }
    });
}