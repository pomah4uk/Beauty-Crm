// ===== РЕНДЕР ИСТОРИИ =====

import { data, clientName } from '../data.js';
import { addSwipeListeners } from './swipe.js';

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
    
    // Фильтруем по периоду
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
    
    // Сортируем: самые последние сверху
    filtered.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
    
    // Обновляем лейбл
    let label = historyPeriod === 'month' 
        ? historyDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
        : historyDate.getFullYear().toString();
    let labelEl = document.getElementById('historyPeriodLabel');
    if (labelEl) labelEl.innerText = label;
    
    let h = '';
    if (filtered.length === 0) {
        h = '<div style="text-align:center;color:#999;padding:20px">Нет записей</div>';
    } else {
        filtered.forEach(r => {
            let st = r.status === 'completed' ? '✅ Выполнена' : '❌ Отменена';
            let sc = r.status === 'completed' ? 'badge-green' : 'badge-red';
            h += `<div class="card">
                <div class="card-header"><span class="card-name">${clientName(r.clientId)}</span><span class="status-badge ${sc}">${st}</span></div>
                <div class="card-row"><span>📅</span><span>${r.date||'—'} ${r.time||'12:00'}</span></div>
                <div class="card-row"><span>💉</span><span>${r.service||'—'}</span></div>
                <div class="card-row"><span>💰</span><span>${r.price?r.price+'₽':'—'}</span></div>
                ${r.comment ? `<div class="card-row"><span>💬</span><span>${r.comment}</span></div>` : ''}
                <div class="card-actions"><button class="small-btn" onclick="event.stopPropagation();window.deleteRecord(${r.id})">🗑️</button></div></div>`;
        });
    }
    document.getElementById('historyList').innerHTML = h;
}