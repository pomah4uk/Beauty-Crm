// ===== РЕНДЕР КЛИЕНТОВ =====

import { data } from '../data.js';
import { addSwipeListeners } from './swipe.js';

export function renderClients() {
    let s = document.getElementById('clientSearch').value.toLowerCase();
    let h = '';
    data.clients.filter(c => c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))).forEach(c => {
        let all = data.records.filter(r => r.clientId === c.id);
        let done = all.filter(r => r.status === 'completed').length;
        let canc = all.filter(r => r.status === 'cancelled').length;
        let t = done + canc, p = t ? Math.round(done / t * 100) : 0;
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${c.id}" data-type="client" onclick="window.showClientStats(${c.id})">
            <div class="card-header"><span class="card-name">${c.name}</span><span style="font-size:.7rem;color:#999">ID:${c.id}</span></div>
            <div class="card-row"><span>📞</span><span>${c.phone||'—'}</span></div>
            <div class="card-row"><span>🎂</span><span>${c.birth||'—'}</span></div>
            <div class="card-row"><span>📅</span><span>${c.lastDate||'—'}</span></div>
            <div class="card-row"><span>💉</span><span>${c.lastService||'—'}</span></div>
            <div class="card-row"><span>⭐ Рейтинг</span><span>${p}% (${done}/${t})</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div></div>`;
    });
    document.getElementById('clientsList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет клиентов</div>';
    addSwipeListeners('clientsList');
}