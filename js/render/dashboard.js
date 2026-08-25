// ===== РЕНДЕР ГЛАВНОЙ =====

import { data, clientName, clientPhone, todayStr, monthExp } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

export function renderDashboard() {
    let n = new Date();
    let m = n.getMonth(), y = n.getFullYear();

    // Выручка за текущий месяц
    let monthRecords = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y);
    let rev = monthRecords.reduce((s, r) => s + (r.price || 0), 0);

    let revenueEl = document.getElementById('statRevenue');
    if (revenueEl) revenueEl.innerText = rev + '₽';

    // Активные заказы
    let activeRecords = data.records
        .filter(r => r.status === 'active')
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    let today = todayStr();
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let tomorrowStr = tomorrow.getFullYear() + '-' +
        (''+(tomorrow.getMonth()+1)).padStart(2,'0') + '-' +
        (''+tomorrow.getDate()).padStart(2,'0');

    let h = '';

    if (activeRecords.length === 0) {
        h = '<div class="empty-state"><span class="emoji">📋</span>Нет активных заказов</div>';
    } else {
        activeRecords.forEach(r => {
            let clientNameStr = clientName(r.clientId);
            let phone = clientPhone(r.clientId);

            let dateBadge = '';
            if (r.date === today) {
                dateBadge = '<span class="status-badge badge-green">Сегодня</span>';
            } else if (r.date === tomorrowStr) {
                dateBadge = '<span class="status-badge badge-blue">Завтра</span>';
            } else {
                dateBadge = `<span style="font-size:.75rem;color:var(--sub);">${r.date}</span>`;
            }

            let paidBadge = '';
            if (r.prepaid > 0) {
                paidBadge = `<span class="pay-badge yellow">Предоплата ${r.prepaid}₽</span>`;
            } else {
                paidBadge = `<span class="pay-badge red">Не оплачено</span>`;
            }

            h += `
                <div class="card swipe-card" style="cursor:pointer;margin-bottom:10px;" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
                    <div class="card-header">
                        <span class="card-name">${clientNameStr}</span>
                        ${dateBadge}
                    </div>
                    <div style="font-size:.95rem;color:var(--sub);margin-bottom:6px;">${r.time||'12:00'} • ${r.service||'—'}</div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:800;font-size:1.2rem;">${r.price} ₽</span>
                        ${paidBadge}
                    </div>
                    ${phone ? `<button class="call-btn" style="margin-top:10px;width:100%;padding:10px;border-radius:14px;font-size:.9rem;" onclick="event.stopPropagation();window.callPhone('${phone}')">📞 Позвонить</button>` : ''}
                </div>`;
        });
    }

    let activeOrdersEl = document.getElementById('activeOrdersList');
    if (activeOrdersEl) {
        activeOrdersEl.innerHTML = h;
        addSwipeListeners('activeOrdersList');
    }
}