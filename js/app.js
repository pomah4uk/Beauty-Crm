// ===== ТОЧКА ВХОДА =====

import { setPage, setOnPageChange } from './router.js?v=7';
import { renderHistory, setHistoryPeriod, shiftHistoryPeriod } from './render/history.js';
import { renderServices } from './render/services.js';
import { renderDashboard } from './render/dashboard.js';
import { setStatsPeriod, shiftStatsPeriod } from './render/stats.js';
import {
    openClientModal, openRecordModal, openExpenseModal, editExpense,
    openServiceModal, editService, showClientStats,
    editRecord, completeRecord, cancelRecord,
    deleteRecord, deleteExpense, deleteService,
    openInactiveModal, exportData, importData, resetData
} from './modals.js?v=7';
import { callPhone } from './utils.js?v=7';
import { initTheme } from './theme.js?v=7';

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.callPhone = callPhone;
window.showClientStats = showClientStats;
window.editService = editService;
window.editExpense = editExpense;
window.editRecord = editRecord;
window.completeRecord = completeRecord;
window.cancelRecord = cancelRecord;
window.deleteRecord = deleteRecord;
window.deleteExpense = deleteExpense;
window.deleteService = deleteService;
window.openRecordModal = openRecordModal;

// ===== КНОПКИ =====
let btn;
btn = document.getElementById('addRecordBtn');
if (btn) btn.onclick = function() { openRecordModal(null); };
btn = document.getElementById('addRecordBtn2');
if (btn) btn.onclick = function() { openRecordModal(null); };
btn = document.getElementById('addClientBtn2');
if (btn) btn.onclick = openClientModal;
btn = document.getElementById('addExpenseBtn');
if (btn) btn.onclick = openExpenseModal;
btn = document.getElementById('addExpenseBtn2');
if (btn) btn.onclick = openExpenseModal;
btn = document.getElementById('addServiceBtn');
if (btn) btn.onclick = openServiceModal;

// ===== ВИДЖЕТЫ =====
document.querySelectorAll('#pageDashboard .dash-stat[data-nav]').forEach(el => {
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
        else if (n === 'stats') setPage('stats');
    };
});

// ===== ПОИСК =====
btn = document.getElementById('clientSearch');
if (btn) btn.oninput = function() { setPage('clients'); };
btn = document.getElementById('recordsSearch');
if (btn) btn.oninput = function() { setPage('records'); };
btn = document.getElementById('historySearch');
if (btn) btn.oninput = function() { renderHistory(); };

document.querySelectorAll('input[name="histFilter"]').forEach(r => {
    r.onchange = function() { renderHistory(); };
});

// ===== ПЕРИОД В ИСТОРИИ =====
document.querySelectorAll('#historyPeriodTabs .period-tab').forEach(tab => {
    tab.onclick = function() { setHistoryPeriod(this.dataset.period); };
});
btn = document.getElementById('historyPeriodPrev');
if (btn) btn.onclick = function() { shiftHistoryPeriod(-1); };
btn = document.getElementById('historyPeriodNext');
if (btn) btn.onclick = function() { shiftHistoryPeriod(1); };

// ===== ПЕРИОД НА СТАТИСТИКЕ =====
document.querySelectorAll('#statsPeriodTabs .period-tab').forEach(tab => {
    tab.onclick = function() { setStatsPeriod(this.dataset.period); };
});
btn = document.getElementById('statsPeriodPrev');
if (btn) btn.onclick = function() { shiftStatsPeriod(-1); };
btn = document.getElementById('statsPeriodNext');
if (btn) btn.onclick = function() { shiftStatsPeriod(1); };

// ===== ДАВНО НЕ ЗАХОДИЛИ =====
btn = document.getElementById('inactiveTitle');
if (btn) btn.onclick = function(e) {
    e.stopPropagation();
    openInactiveModal();
};

// ===== ССЫЛКА =====
btn = document.getElementById('shareHeaderBtn');
if (btn) btn.onclick = async function() {
    let link = 'https://pomah4uk.github.io/Beauty-Crm/booking.html';
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Красивые губы',
                text: 'Ждут тебя здесь!!!',
                url: link
            });
        } catch(e) {}
    } else {
        navigator.clipboard.writeText(link)
            .then(() => toast('📋 Ссылка скопирована'))
            .catch(() => {});
    }
};

// ===== БЭКАП =====
btn = document.getElementById('backupHeaderBtn');
if (btn) btn.onclick = function() { setPage('backup'); };
btn = document.getElementById('exportBtn');
if (btn) btn.onclick = exportData;
btn = document.getElementById('importBtn');
if (btn) btn.onclick = function() { document.getElementById('importFile').click(); };
btn = document.getElementById('importFile');
if (btn) btn.onchange = function(e) {
    let f = e.target.files[0];
    if (f) {
        importData(f);
        e.target.value = '';
    }
};
btn = document.getElementById('resetBtn');
if (btn) btn.onclick = function() { resetData(); };

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
    let navBtn = document.getElementById('navBackBtn');
    if (navBtn) {
        navBtn.style.display = (page === 'dashboard') ? 'none' : 'block';
    }
}
setOnPageChange(updateNavBack);

window.goHome = function() {
    setPage('dashboard');
};

// ===== TOAST =====
window.toast = function(msg) {
    let t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
};

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

// ===== СТАРТ =====
setPage('dashboard');
initTheme();