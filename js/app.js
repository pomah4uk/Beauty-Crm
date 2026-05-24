// ===== ТОЧКА ВХОДА =====

import { setPage, setOnPageChange } from './router.js?v=7';
import { renderHistory } from './render/history.js';
import { renderServices } from './render/services.js';
import { setPeriod, shiftPeriod } from './render/dashboard.js';
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
import { setRecordsView } from './render/records.js?v=7';

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
document.getElementById('addRecordBtn').onclick = function() { openRecordModal(null); };
document.getElementById('addRecordBtn2').onclick = function() { openRecordModal(null); };
document.getElementById('addClientBtn2').onclick = openClientModal;
document.getElementById('addExpenseBtn').onclick = openExpenseModal;
document.getElementById('addExpenseBtn2').onclick = openExpenseModal;
document.getElementById('addServiceBtn').onclick = openServiceModal;

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

// ===== ПЕРЕКЛЮЧАТЕЛЬ ВИДА ЗАПИСЕЙ =====
document.querySelectorAll('#recordsViewTabs .small-btn').forEach(tab => {
    tab.onclick = function() {
        setRecordsView(this.dataset.view);
    };
});

// ===== ПОИСК =====
document.getElementById('clientSearch').oninput = function() { setPage('clients'); };
document.getElementById('recordsSearch').oninput = function() { setPage('records'); };
document.getElementById('historySearch').oninput = function() { renderHistory(); };
document.querySelectorAll('input[name="histFilter"]').forEach(r => {
    r.onchange = function() { renderHistory(); };
});

// ===== ПЕРИОД НА ГЛАВНОЙ =====
document.querySelectorAll('#periodTabs .period-tab').forEach(tab => {
    tab.onclick = function() { setPeriod(this.dataset.period); };
});
document.getElementById('periodPrev').onclick = function() { shiftPeriod(-1); };
document.getElementById('periodNext').onclick = function() { shiftPeriod(1); };

// ===== ПЕРИОД НА СТАТИСТИКЕ =====
document.querySelectorAll('#statsPeriodTabs .period-tab').forEach(tab => {
    tab.onclick = function() { setStatsPeriod(this.dataset.period); };
});
document.getElementById('statsPeriodPrev').onclick = function() { shiftStatsPeriod(-1); };
document.getElementById('statsPeriodNext').onclick = function() { shiftStatsPeriod(1); };

// ===== ДАВНО НЕ ЗАХОДИЛИ =====
document.getElementById('inactiveTitle').onclick = function(e) {
    e.stopPropagation();
    openInactiveModal();
};

// ===== БЭКАП =====
document.getElementById('backupHeaderBtn').onclick = function() {
    setPage('backup');
};
document.getElementById('exportBtn').onclick = exportData;
document.getElementById('importBtn').onclick = function() {
    document.getElementById('importFile').click();
};
document.getElementById('importFile').onchange = function(e) {
    let f = e.target.files[0];
    if (f) {
        importData(f);
        e.target.value = '';
    }
};
document.getElementById('resetBtn').onclick = function() {
    resetData();
};

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

window.goHome = function() {
    setPage('dashboard');
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