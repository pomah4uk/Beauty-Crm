// ===== РЕНДЕР ИСТОРИИ =====

import { data, clientName } from '../data.js';
import { addSwipeListeners } from './swipe.js';

export function renderHistory() {
    let s = document.getElementById('historySearch').value.toLowerCase();
    let f = document.querySelector('input[name="histFilter"]:checked')?.value || 'all';
    let h = '';
    data.records.filter(r => (r.status === 'completed' || r.status === 'cancelled') && clientName(r.clientId).toLowerCase().includes(s) && (f === 'all' || r.status === f)).forEach(r => {
        let st = r.status === 'completed' ? '✅ Выполнена' : '❌ Отменена';
        let sc = r.status === 'completed' ? 'badge-green' : 'badge-red';
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${r.id}" data-type="history">
            <div class="card-header"><span class="card-name">${clientName(r.clientId)}</span><span class="status-badge ${sc}">${st}</span></div>
            <div class="card-row"><span>📅</span><span>${r.date||'—'} ${r.time||'12:00'}</span></div>
            <div class="card-row"><span>💉</span><span>${r.service||'—'}</span></div>
            <div class="card-row"><span>💰</span><span>${r.price?r.price+'₽':'—'}</span></div></div>`;
    });
    document.getElementById('historyList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет записей</div>';
    addSwipeListeners('historyList');
}