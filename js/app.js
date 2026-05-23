// ===== ТОЧКА ВХОДА =====

import { setPage, setOnPageChange } from './router.js?v=2';
import { renderHistory, renderServices, setPeriod, shiftPeriod } from './render.js?v=2';
import {
    openClientModal, openRecordModal, openExpenseModal,
    openServiceModal, editService, showClientStats,
    editRecord, completeRecord, cancelRecord,
    deleteRecord, deleteExpense, deleteService,
    openInactiveModal, exportData, importData, resetData
} from './modals.js?v=2';
import { copyPhone, callPhone } from './utils.js?v=2';
import { initTheme } from './theme.js?v=2';

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.copyPhone = copyPhone;
window.callPhone = callPhone;
window.showClientStats = showClientStats;
window.editService = editService;
window.editRecord = editRecord;
window.completeRecord = completeRecord;
window.cancelRecord = cancelRecord;
window.deleteRecord = deleteRecord;
window.deleteExpense = deleteExpense;
window.deleteService = deleteService;

// ===== КНОПКИ =====
document.getElementById('addRecordBtn').onclick = function() { openRecordModal(null); };
document.getElementById('addRecordBtn2').onclick = function() { openRecordModal(null); };
document.getElementById('addClientBtn2').onclick = openClientModal;
document.getElementById('addExpenseBtn').onclick = openExpenseModal;
document.getElementById('addExpenseBtn2').onclick = openExpenseModal;
document.getElementById('addServiceBtn').onclick = openServiceModal;

// ===== ВИДЖЕТЫ =====
document.querySelectorAll('.dash-stat[data-nav]').forEach(el => {
    el.onclick = function() {
        let n = this.dataset.nav;
        if (n === 'clients') setPage('clients');
        else if (n === 'active') setPage('records');
        else if (n === 'completed') {
            setPage('history');
            setTimeout(() => {
                let rb = document.querySelector('input[name="histFilter"][value="completed"]');
                if (rb) { rb.checked = true; renderHistory(); }
            }, 50);
        }
        else if (n === 'cancelled') {
            setPage('history');
            setTimeout(() => {
                let rb = document.querySelector('input[name="histFilter"][value="cancelled"]');
                if (rb) { rb.checked = true; renderHistory(); }
            }, 50);
        }
        else if (n === 'expenses') setPage('expenses');
        else if (n === 'services') setPage('services');
    };
});

// ===== ПОИСК =====
document.getElementById('clientSearch').oninput = function() { setPage('clients'); };
document.getElementById('recordsSearch').oninput = function() { setPage('records'); };
document.getElementById('historySearch').oninput = function() { renderHistory(); };
document.querySelectorAll('input[name="histFilter"]').forEach(r => {
    r.onchange = function() { renderHistory(); };
});

// ===== ПЕРИОД =====
document.querySelectorAll('.period-tab').forEach(tab => {
    tab.onclick = function() { setPeriod(this.dataset.period); };
});
document.getElementById('periodPrev').onclick = function() { shiftPeriod(-1); };
document.getElementById('periodNext').onclick = function() { shiftPeriod(1); };

// ===== ДАВНО НЕ ЗАХОДИЛИ =====
document.getElementById('inactiveTitle').onclick = function(e) {
    e.stopPropagation();
    openInactiveModal();
};

// ===== БЭКАП =====
document.getElementById('backupLink').onclick = function() { setPage('backup'); };
document.getElementById('exportBtn').onclick = exportData;
document.getElementById('importBtn').onclick = function() { document.getElementById('importFile').click(); };
document.getElementById('importFile').onchange = function(e) {
    let f = e.target.files[0];
    if (f) { importData(f); e.target.value = ''; }
};
document.getElementById('resetBtn').onclick = resetData;

// ===== ЗАКРЫТИЕ МОДАЛОК =====
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

// ===== КНОПКА НАЗАД =====
function updateNavBack(page) {
    let nav = document.getElementById('navBack');
    if (nav) {
        nav.style.display = (page === 'dashboard') ? 'none' : 'flex';
    }
}
setOnPageChange(updateNavBack);

// ===== КНОПКА ВВЕРХ =====
window.addEventListener('scroll', function() {
    let btn = document.querySelector('.scroll-top');
    if (btn) btn.style.display = window.scrollY > 300 ? 'flex' : 'none';
});

let sb = document.createElement('div');
sb.className = 'scroll-top';
sb.innerHTML = '⬆';
sb.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
document.body.appendChild(sb);

// ===== SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// ===== КНОПКА ДОМОЙ =====
window.goHome = function() {
    setPage('dashboard');
};

// ===== СТАРТ =====
setPage('dashboard');
initTheme();