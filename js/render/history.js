// ===== РЕНДЕР ИСТОРИИ =====

import { data, clientName } from '../data.js';

let historyPeriod = 'month';
let historyDate = new Date();

export function setHistoryPeriod(period) {
    historyPeriod = period;
    historyDate = new Date();
    document.querySelectorAll('#historyPeriodTabs .period-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`#historyPeriodTabs .period-tab[data-period="${period}"]`)?.classList.add('active');
    renderHistory();
}

export function shiftHistoryPeriod(dir) {
    if (historyPeriod === 'month') historyDate.setMonth(historyDate.getMonth() + dir);
    else historyDate.setFullYear(historyDate.getFullYear() + dir);
    renderHistory();
}

export function renderHistory() {
    let m = historyDate.getMonth();
    let y = historyDate.getFullYear();

    let filtered = data.records.filter(r => {
        if (r.status !== 'completed' && r.status !== 'cancelled') return false;
        if (!r.date) return false;
        let d = new Date(r.date);
        if (historyPeriod === 'month') {
            return d.getMonth() === m && d.getFullYear() === y;
        } else {
            return d.getFullYear() === y;
        }
    });

    filtered.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

    let label = historyPeriod === 'month'
        ? historyDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
        : historyDate.getFullYear().toString();
    let labelEl = document.getElementById('historyPeriodLabel');
    if (labelEl) labelEl.innerText = label;

    let f = document.querySelector('input[name="histFilter"]:checked')?.value || 'all';
    if (f === 'completed') filtered = filtered.filter(r => r.status === 'completed');
    if (f === 'cancelled') filtered = filtered.filter(r => r.status === 'cancelled');

    let h = '';

    if (filtered.length === 0) {
        h = '<div class="empty-state"><span class="emoji">📋</span>Нет записей</div>';
    } else {
        filtered.forEach(r => {
            let st = r.status === 'completed' ? '✅' : '❌';
            let sc = r.status === 'completed' ? 'badge-green' : 'badge-red';

            h += `
                <div class="card">
                    <div class="card-header">
                        <span class="card-name">${clientName(r.clientId)}</span>
                        <span class="status-badge ${sc}">${st}</span>
                    </div>
                    <div style="font-size:.85rem;color:var(--sub);margin-bottom:6px;">${r.date||'—'} ${r.time||'12:00'}</div>
                    <div style="font-size:1rem;margin-bottom:6px;">${r.service||'—'}</div>
                    ${r.comment ? `<div style="font-size:.85rem;color:var(--sub);margin-bottom:6px;">💬 ${r.comment}</div>` : ''}
                    <div style="font-weight:800;font-size:1.1rem;">${r.price ? r.price + '₽' : '—'}</div>
                </div>`;
        });
    }

    document.getElementById('historyList').innerHTML = h;
}