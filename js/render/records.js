// ===== РЕНДЕР АКТИВНЫХ ЗАПИСЕЙ =====

import { data, clientName, clientPhone, getServiceColor } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

export function renderActive() {
    let s = document.getElementById('recordsSearch')?.value?.toLowerCase() || '';
    let filtered = data.records
        .filter(r => r.status === 'active' && clientName(r.clientId).toLowerCase().includes(s))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    let h = '';

    if (!filtered.length) {
        h = '<div class="empty-state"><span class="emoji">📋</span>Нет активных записей</div>';
    } else {
        filtered.forEach(r => {
            let p = clientPhone(r.clientId);
            let c = data.clients.find(x => x.id === r.clientId);

            let paidStatus = '';
            if (r.prepaid > 0) {
                paidStatus = `<span class="pay-badge yellow">Предоплата ${r.prepaid}₽</span>`;
            } else {
                paidStatus = `<span class="pay-badge red">Не оплачено</span>`;
            }

            h += `
                <div class="card" onclick="window.editRecord(${r.id})">
                    <div class="card-header">
                        <span class="card-name">${clientName(r.clientId)}</span>
                        <span style="font-size:.85rem;color:var(--sub);">${r.time||'12:00'}</span>
                    </div>
                    <div style="font-size:.95rem;color:var(--sub);margin-bottom:8px;">${r.date||'—'}</div>
                    <div style="font-size:1rem;margin-bottom:8px;">${r.service||'—'}</div>
                    ${c && c.comment ? `<div style="font-size:.85rem;color:var(--sub);margin-bottom:8px;">💬 ${c.comment}</div>` : ''}
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:800;font-size:1.2rem;">${r.price} ₽</span>
                        ${paidStatus}
                    </div>
                    ${p ? `<button class="call-btn" style="margin-top:12px;width:100%;padding:10px;border-radius:14px;font-size:.9rem;" onclick="event.stopPropagation();window.callPhone('${p}')">📞 Позвонить</button>` : ''}
                </div>`;
        });
    }

    document.getElementById('recordsList').innerHTML = h;
    addSwipeListeners('recordsList');
}