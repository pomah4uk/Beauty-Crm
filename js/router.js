// ===== НАВИГАЦИЯ =====

import { onDataChange } from './data.js';
import {
    renderDashboard, renderClients, renderActive,
    renderHistory, renderExpenses, renderServices
} from './render.js';

export let currentPage = 'dashboard';

const titles = {
    dashboard: 'Главная',
    clients: 'Клиенты',
    records: 'Активные записи',
    history: 'История',
    expenses: 'Расходы',
    services: 'Услуги',
    backup: 'Бэкап'
};

// При любом save() — перерисовываем текущую страницу
onDataChange(() => {
    renderCurrentPage();
});

function renderCurrentPage() {
    switch (currentPage) {
        case 'dashboard': renderDashboard(); break;
        case 'clients':   renderClients(); break;
        case 'records':   renderActive(); break;
        case 'history':   renderHistory(); break;
        case 'expenses':  renderExpenses(); break;
        case 'services':  renderServices(); break;
    }
}

export function setPage(p) {
    currentPage = p;

    ['Dashboard', 'Clients', 'Records', 'History', 'Expenses', 'Services', 'Backup'].forEach(name => {
        let el = document.getElementById('page' + name);
        if (el) el.style.display = (p === name.toLowerCase()) ? 'block' : 'none';
    });

    document.getElementById('pageTitle').innerText = titles[p] || '';

    // Возвращаемся на главную — всегда перерисовываем
    renderCurrentPage();
}