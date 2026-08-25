// ===== РЕНДЕР СТАТИСТИКИ =====

import { data, monthExp } from '../data.js';

let statsPeriod = 'month';
let statsDate = new Date();

export function setStatsPeriod(period) {
    statsPeriod = period;
    statsDate = new Date();
    document.querySelectorAll('#statsPeriodTabs .period-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`#statsPeriodTabs .period-tab[data-period="${period}"]`)?.classList.add('active');
    renderStats();
}

export function shiftStatsPeriod(dir) {
    if (statsPeriod === 'day') statsDate.setDate(statsDate.getDate() + dir);
    else if (statsPeriod === 'month') statsDate.setMonth(statsDate.getMonth() + dir);
    else statsDate.setFullYear(statsDate.getFullYear() + dir);
    renderStats();
}

export function renderStats() {
    let n = statsDate;
    let m = n.getMonth(), y = n.getFullYear();

    let periodRecords;
    let periodLabel;

    if (statsPeriod === 'day') {
        let dateStr = n.getFullYear() + '-' + (''+(n.getMonth()+1)).padStart(2,'0') + '-' + (''+n.getDate()).padStart(2,'0');
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date === dateStr);
        periodLabel = n.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (statsPeriod === 'month') {
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y);
        periodLabel = n.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    } else {
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getFullYear() === y);
        periodLabel = n.getFullYear().toString();
    }

    let rev = periodRecords.reduce((s, r) => s + (r.price || 0), 0);

    let exp;
    if (statsPeriod === 'day') {
        let dateStr = n.getFullYear() + '-' + (''+(n.getMonth()+1)).padStart(2,'0') + '-' + (''+n.getDate()).padStart(2,'0');
        exp = data.expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
    } else if (statsPeriod === 'month') {
        exp = monthExp(m, y);
    } else {
        exp = data.expenses.filter(e => new Date(e.date).getFullYear() === y).reduce((s, e) => s + e.amount, 0);
    }

    let canc;
    if (statsPeriod === 'day') {
        let dateStr = n.getFullYear() + '-' + (''+(n.getMonth()+1)).padStart(2,'0') + '-' + (''+n.getDate()).padStart(2,'0');
        canc = data.records.filter(r => r.status === 'cancelled' && r.date === dateStr).length;
    } else if (statsPeriod === 'month') {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y).length;
    } else {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date && new Date(r.date).getFullYear() === y).length;
    }

    let avg = periodRecords.length ? Math.round(rev / periodRecords.length) : 0;

    document.getElementById('statsPeriodLabel').innerText = periodLabel;
    document.getElementById('statsRevenue').innerText = rev + '₽';
    document.getElementById('statsCost').innerText = exp + '₽';
    document.getElementById('statsProfit').innerText = (rev - exp) + '₽';
    document.getElementById('statsAvg').innerText = avg + '₽';
    document.getElementById('statsCompleted').innerText = periodRecords.length;
    document.getElementById('statsCancelled').innerText = canc;

    // Топ услуг — все услуги за период, отсортированные по сумме
    let serviceStats = {};
    periodRecords.forEach(r => {
        let services = (r.service || '—').split(' + ');
        services.forEach(svc => {
            svc = svc.trim();
            if (svc && svc !== '—') {
                if (!serviceStats[svc]) {
                    serviceStats[svc] = { count: 0, sum: 0 };
                }
                serviceStats[svc].count++;
                serviceStats[svc].sum += r.price || 0;
            }
        });
    });

    let sortedServices = Object.entries(serviceStats).sort((a, b) => b[1].sum - a[1].sum);

    let sh = '';
    if (sortedServices.length === 0) {
        sh = '<div class="empty-state">Нет услуг за период</div>';
    } else {
        sortedServices.forEach(([name, data], index) => {
            sh += `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;gap:8px;">
                    <span style="color:var(--sub);font-size:.85rem;font-weight:600;">${index + 1}.</span>
                    <span style="flex:1;font-weight:600;font-size:1rem;">${name}</span>
                    <span style="font-size:.8rem;color:var(--sub);white-space:nowrap;">${data.count} раз(а)</span>
                    <span style="font-weight:800;font-size:1.1rem;color:var(--accent);white-space:nowrap;">${data.sum}₽</span>
                </div>`;
        });
    }

    let statsTopServices = document.getElementById('statsTopServices');
    if (statsTopServices) {
        statsTopServices.innerHTML = sh;
    }
}