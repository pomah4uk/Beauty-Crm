// ===== НАВИГАЦИЯ =====

import { renderDashboard, setPeriod, shiftPeriod } from './render/dashboard.js';
import { renderClients } from './render/clients.js';
import { renderActive } from './render/records.js';
import { renderHistory } from './render/history.js';
import { renderExpenses } from './render/expenses.js';
import { renderServices } from './render/services.js';
import { renderStats } from './render/stats.js';
import { onDataChange } from './data.js';

export let currentPage = 'dashboard';

const titles = {
    dashboard: 'Главная',
    clients: 'Клиенты',
    records: 'Активные записи',
    history: 'История',
    stats: 'Статистика',
    expenses: 'Расходы',
    services: 'Услуги',
    backup: 'Бэкап'
};

let onPageChange = null;
export function setOnPageChange(fn) {
    onPageChange = fn;
}

onDataChange(() => {
    renderCurrentPage();
});

function renderCurrentPage() {
    switch (currentPage) {
        case 'dashboard': renderDashboard(); break;
        case 'clients':   renderClients(); break;
        case 'records':   renderActive(); break;
        case 'history':   renderHistory(); break;
        case 'stats':     renderStats(); break;
        case 'expenses':  renderExpenses(); break;
        case 'services':  renderServices(); break;
    }
}

export function setPage(p) {
    currentPage = p;

    ['Dashboard', 'Clients', 'Records', 'History', 'Stats', 'Expenses', 'Services', 'Backup'].forEach(name => {
        let el = document.getElementById('page' + name);
        if (el) el.style.display = (p === name.toLowerCase()) ? 'block' : 'none';
    });

    document.getElementById('pageTitle').innerText = titles[p] || '';

    if (onPageChange) onPageChange(p);
    renderCurrentPage();
}