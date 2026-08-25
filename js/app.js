// ===== ТОЧКА ВХОДА =====

import { setPage, setOnPageChange } from './router.js?v=11';
import { renderHistory, setHistoryPeriod, shiftHistoryPeriod } from './render/history.js?v=11';
import { renderServices } from './render/services.js?v=11';
import { renderDashboard, shiftDashboardDate, setDashboardDate } from './render/dashboard.js?v=11';
import { setStatsPeriod, shiftStatsPeriod } from './render/stats.js?v=11';
import {
    openClientModal, openRecordModal, openExpenseModal, editExpense,
    openServiceModal, editService, showClientStats,
    editRecord, completeRecord, cancelRecord,
    deleteRecord, deleteExpense, deleteService,
    openInactiveModal, exportData, importData, resetData
} from './modals.js?v=11';
import { callPhone } from './utils.js?v=11';
import { initTheme, toggleTheme, randomTheme } from './theme.js?v=11';

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
window.goPage = function(page) { setPage(page); };
window.goHome = function() { setPage('dashboard'); };

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

// ===== МЕНЮ =====
btn = document.getElementById('menuBtn');
if (btn) btn.onclick = function() { setPage('menu'); };
btn = document.getElementById('menuCloseBtn');
if (btn) btn.onclick = function() { setPage('dashboard'); };

document.querySelectorAll('#pageMenu [data-page]').forEach(btn => {
    btn.onclick = function() { setPage(this.dataset.page); };
});

// ===== ПЕРЕКЛЮЧАТЕЛЬ ДАТ НА ГЛАВНОЙ =====
btn = document.getElementById('datePrevBtn');
if (btn) btn.onclick = function() { shiftDashboardDate(-1); };
btn = document.getElementById('dateNextBtn');
if (btn) btn.onclick = function() { shiftDashboardDate(1); };

// ===== ПОДЕЛИТЬСЯ =====
btn = document.getElementById('shareMenuBtn');
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

// ===== ТЕМА В МЕНЮ =====
btn = document.getElementById('themeMenuBtn');
if (btn) btn.onclick = function() { toggleTheme(); };
btn = document.getElementById('randomThemeMenuBtn');
if (btn) btn.onclick = function() { randomTheme(); };

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

// ===== БЭКАП =====
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