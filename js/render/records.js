// ===== РЕНДЕР АКТИВНЫХ ЗАПИСЕЙ =====

import { data, clientName, clientPhone, getServiceColor } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

let recordsView = localStorage.getItem('recordsView') || 'list';

export function setRecordsView(view) {
    recordsView = view;
    localStorage.setItem('recordsView', view);
    document.querySelectorAll('#recordsViewTabs .small-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`#recordsViewTabs .small-btn[data-view="${view}"]`)?.classList.add('active');
    renderActive();
}

export function renderActive() {
    let s = document.getElementById('recordsSearch')?.value?.toLowerCase() || '';
    let filtered = data.records
        .filter(r => r.status === 'active' && clientName(r.clientId).toLowerCase().includes(s))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    
    let h = '';
    
    if (recordsView === 'list') {
        // Режим списка (как сейчас)
        if (!filtered.length) {
            h = '<div style="text-align:center;color:#999;padding:20px">Нет активных записей</div>';
        } else {
            filtered.forEach(r => {
                let p = clientPhone(r.clientId);
                let color = getServiceColor(r.service?.split(' + ')[0]);
                let c = data.clients.find(x => x.id === r.clientId);
                h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
                    <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
                    ${c && c.comment ? `<div style="font-size:.75rem;color:#888;margin-bottom:8px">💬 ${c.comment}</div>` : ''}
                    ${p?`<button class="btn btn-success" style="margin-top:8px;margin-bottom:0" onclick="event.stopPropagation();window.callPhone('${p}')">📞 Позвонить</button>`:''}</div>`;
            });
        }
    } else {
        // Режим плиток
        if (!filtered.length) {
            h = '<div style="text-align:center;color:#999;padding:20px">Нет активных записей</div>';
        } else {
            h = '<div class="flex wrap" style="gap:10px">';
            filtered.forEach(r => {
                let p = clientPhone(r.clientId);
                let color = getServiceColor(r.service?.split(' + ')[0]);
                let c = data.clients.find(x => x.id === r.clientId);
                h += `<div class="card swipe-card pad12" style="cursor:pointer;flex:1;min-width:140px;max-width:200px;border-top:4px solid ${color}" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
                    <div class="card-name mb8">${clientName(r.clientId)}</div>
                    <div style="font-size:.75rem;color:#999;margin-bottom:4px">📅 ${r.date||'—'}</div>
                    <div style="font-size:.85rem;color:#666;margin-bottom:4px">🕐 ${r.time||'12:00'} — ${r.service||'—'}</div>
                    ${c && c.comment ? `<div style="font-size:.7rem;color:#888;margin-bottom:4px">💬 ${c.comment}</div>` : ''}
                    <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
                        <span class="status-badge badge-blue">📝</span>
                        ${p?`<button class="call-btn" style="margin-left:auto" onclick="event.stopPropagation();window.callPhone('${p}')">📞</button>`:''}
                    </div></div>`;
            });
            h += '</div>';
        }
    }
    
    document.getElementById('recordsList').innerHTML = h;
    addSwipeListeners('recordsList');
}