// ===== РЕНДЕР КЛИЕНТОВ =====

import { data } from '../data.js';
import { addSwipeListeners } from './swipe.js';

export function renderClients() {
    let s = document.getElementById('clientSearch').value.toLowerCase();
    let filtered = data.clients.filter(c =>
        c.name.toLowerCase().includes(s) ||
        (c.phone && c.phone.includes(s))
    );

    let h = '';

    if (filtered.length === 0) {
        h = '<div class="empty-state"><span class="emoji">👥</span>Нет клиентов</div>';
    } else {
        filtered.forEach(c => {
            let all = data.records.filter(r => r.clientId === c.id);
            let done = all.filter(r => r.status === 'completed').length;
            let canc = all.filter(r => r.status === 'cancelled').length;
            let total = done + canc;
            let p = total ? Math.round(done / total * 100) : 0;

            h += `
                <div class="card" onclick="window.showClientStats(${c.id})">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                        <div style="width:46px;height:46px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">👤</div>
                        <div style="flex:1;">
                            <div class="card-name">${c.name}</div>
                            <div style="font-size:.8rem;color:var(--sub);">${c.phone || '—'}</div>
                        </div>
                    </div>
                    ${c.comment ? `<div style="font-size:.9rem;color:var(--sub);margin-bottom:12px;">💬 ${c.comment}</div>` : ''}
                    <div style="display:flex;gap:16px;font-size:.9rem;font-weight:600;padding-top:10px;">
                        <span style="color:#1a9e55;">✅ ${done}</span>
                        <span style="color:#d63a2a;">❌ ${canc}</span>
                        <span style="color:var(--accent);">⭐ ${p}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${p}%"></div>
                    </div>
                </div>`;
        });
    }

    document.getElementById('clientsList').innerHTML = h;
    addSwipeListeners('clientsList');
}