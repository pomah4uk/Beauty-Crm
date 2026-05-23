// ===== РЕНДЕР АКТИВНЫХ ЗАПИСЕЙ =====

import { data, clientName, clientPhone, getServiceColor } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

export function renderActive() {
    let s = document.getElementById('recordsSearch').value.toLowerCase();
    let h = '';
    data.records.filter(r => r.status === 'active' && clientName(r.clientId).toLowerCase().includes(s)).forEach(r => {
        let p = clientPhone(r.clientId);
        let color = getServiceColor(r.service?.split(' + ')[0]);
        let c = data.clients.find(x => x.id === r.clientId);
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
            <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
            ${c && c.comment ? `<div style="font-size:.75rem;color:#888;margin-bottom:8px">💬 ${c.comment}</div>` : ''}
            ${p?`<button class="btn btn-success" style="margin-top:8px;margin-bottom:0" onclick="event.stopPropagation();window.callPhone('${p}')">📞 Позвонить</button>`:''}</div>`;
    });
    document.getElementById('recordsList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет активных записей</div>';
    addSwipeListeners('recordsList');
}