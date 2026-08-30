// ===== НАВИГАЦИЯ =====

import { onDataChange } from './data.js';
import { renderDashboard } from './render/dashboard.js';
import { renderClients } from './render/clients.js';
import { renderActive } from './render/records.js';
import { renderHistory } from './render/history.js';
import { renderExpenses } from './render/expenses.js';
import { renderServices } from './render/services.js';
import { renderStats } from './render/stats.js';

export let currentPage = 'dashboard';

const titles = {
    dashboard: 'Рабочее место',
    menu: 'Меню',
    clients: 'Клиенты',
    records: 'Активные заказы',
    history: 'История',
    stats: 'Статистика',
    services: 'Услуги',
    expenses: 'Расходы',
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
        case 'services':  renderServices(); break;
        case 'expenses':  renderExpenses(); break;
        case 'menu':      break;
    }
}

export function setPage(p) {
    currentPage = p;

    ['Dashboard', 'Menu', 'Clients', 'Records', 'History', 'Stats', 'Services', 'Expenses', 'Backup'].forEach(name => {
        let el = document.getElementById('page' + name);
        if (el) el.style.display = (p === name.toLowerCase()) ? 'block' : 'none';
    });

    let pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) {
        pageTitleEl.innerText = titles[p] || '';
    }

    if (onPageChange) onPageChange(p);
    renderCurrentPage();
}