// ===== РЕНДЕР СТАТИСТИКИ =====

import { data, monthExp, getServiceColor } from '../data.js';

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
        let dateStr = n.toISOString().slice(0, 10);
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date === dateStr);
        periodLabel = n.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
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
        exp = data.expenses.filter(e => e.date === n.toISOString().slice(0, 10)).reduce((s, e) => s + e.amount, 0);
    } else if (statsPeriod === 'month') {
        exp = monthExp(m, y);
    } else {
        exp = data.expenses.filter(e => new Date(e.date).getFullYear() === y).reduce((s, e) => s + e.amount, 0);
    }
    
    let canc;
    if (statsPeriod === 'day') {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date === n.toISOString().slice(0, 10)).length;
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
    
    // Топ услуг
    let ss = {};
    periodRecords.forEach(r => {
        if (r.service) {
            let name = r.service.split(' + ')[0];
            if (!ss[name]) ss[name] = { count: 0, sum: 0 };
            ss[name].count++;
            ss[name].sum += r.price || 0;
        }
    });
    let topServices = Object.entries(ss).sort((a, b) => b[1].sum - a[1].sum).slice(0, 5);
    
    let h = '';
    if (!topServices.length) {
        h = '<div style="text-align:center;color:#999;padding:12px">Нет данных</div>';
    } else {
        topServices.forEach(([name, s]) => {
            let color = getServiceColor(name);
            h += `<div class="card-row">
                <span><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${color};margin-right:6px"></span>${name}</span>
                <span>${s.count} раз — ${s.sum}₽</span></div>`;
        });
    }
    document.getElementById('statsTopServices').innerHTML = h;
}