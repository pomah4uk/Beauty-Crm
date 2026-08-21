// ===== РЕНДЕР ГЛАВНОЙ =====

import { data, clientName, clientPhone, todayStr, daysSince, monthExp, getServiceColor } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

export function renderDashboard() {
    let n = new Date();
    let m = n.getMonth(), y = n.getFullYear();

    let mr = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y);
    let rev = mr.reduce((s, r) => s + (r.price || 0), 0);
    let exp = monthExp(m, y);
    let canc = data.records.filter(r => r.status === 'cancelled' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y).length;
    let act = data.records.filter(r => r.status === 'active').length;
    let avg = mr.length ? Math.round(rev / mr.length) : 0;
    let ss = {}; mr.forEach(r => { if (r.service) ss[r.service] = (ss[r.service] || 0) + 1; });
    let top = Object.entries(ss).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Виджеты
    document.getElementById('statActive').innerText = act;
    document.getElementById('statCompleted').innerText = mr.length;
    document.getElementById('statCancelled').innerText = canc;
    document.getElementById('statRevenue').innerText = rev + '₽';
    document.getElementById('statCost').innerText = exp + '₽';
    document.getElementById('statProfit').innerText = (rev - exp) + '₽';
    document.getElementById('statAvgCheck').innerText = avg + '₽';
    document.getElementById('statTopService').innerText = top.length > 15 ? top.slice(0, 15) + '…' : top;
    document.getElementById('statTotalClients').innerText = data.clients.length;
    document.getElementById('inactiveDaysLabel').innerText = data.inactiveDays;

    // Календарь сегодня/завтра
    let today = todayStr();
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    let tomorrowStr = tomorrow.getFullYear() + '-' +
        (''+(tomorrow.getMonth()+1)).padStart(2,'0') + '-' +
        (''+tomorrow.getDate()).padStart(2,'0');

    document.getElementById('todayDate').innerText = today;
    document.getElementById('tomorrowDate').innerText = tomorrowStr;

    let todayRecords = data.records.filter(r => r.status === 'active' && r.date === today).sort((a, b) => (a.time||'12:00').localeCompare(b.time||'12:00'));
    let tomorrowRecords = data.records.filter(r => r.status === 'active' && r.date === tomorrowStr).sort((a, b) => (a.time||'12:00').localeCompare(b.time||'12:00'));

    function renderCal(list, elId) {
        let h = '';
        let dayTotal = 0;
        if (!list.length) {
            h = '<div class="empty-state">Нет записей</div>';
        } else {
            list.forEach(r => {
                let p = clientPhone(r.clientId);
                let color = getServiceColor(r.service?.split(' + ')[0]);
                let c = data.clients.find(x => x.id === r.clientId);
                dayTotal += r.price || 0;

                let paidStatus = '';
                if (r.prepaid > 0) {
                    paidStatus = `<div style="margin-top:6px;padding:5px 10px;border:1px solid #f5a623;border-radius:8px;color:#f5a623;font-size:.7rem;font-weight:600;">🟡 Предоплата: ${r.prepaid}₽</div>`;
                } else {
                    paidStatus = `<div style="margin-top:6px;padding:5px 10px;border:1px solid #e74c3c;border-radius:8px;color:#e74c3c;font-size:.7rem;font-weight:600;">🔴 Не оплачено</div>`;
                }

                h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
                    <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
                    ${c && c.comment ? `<div style="font-size:.75rem;color:#888;margin-bottom:6px">💬 ${c.comment}</div>` : ''}
                    <div style="font-weight:700;font-size:1rem;">${r.price} ₽</div>
                    ${paidStatus}
                    ${p?`<button class="btn btn-success" style="margin-top:8px;margin-bottom:0" onclick="event.stopPropagation();window.callPhone('${p}')">📞 Позвонить</button>`:''}</div>`;
            });
        }
        document.getElementById(elId).innerHTML = h;
        document.getElementById(elId + 'Total').innerText = dayTotal;
        addSwipeListeners(elId);
    }

    renderCal(todayRecords, 'todayList');
    renderCal(tomorrowRecords, 'tomorrowList');
    document.getElementById('todayBlock').style.display = todayRecords.length ? 'block' : 'none';
    document.getElementById('tomorrowBlock').style.display = tomorrowRecords.length ? 'block' : 'none';

    // Давно не заходили
    let list = data.clients.filter(c => daysSince(c.lastDate) > data.inactiveDays && c.lastDate).sort((a, b) => daysSince(b.lastDate) - daysSince(a.lastDate));
    let h = '';
    if (!list.length) {
        h = '<div class="empty-state">Все активны 👍</div>';
    } else {
        list.forEach(c => {
            let d = daysSince(c.lastDate), cls = d > 60 ? 'days-danger' : 'days-warn';
            let cid = c.id;
            h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${cid}" data-type="inactive" onclick="window.showClientStats(${cid})">
                <div class="flex between mb8"><span class="card-name">${c.name}</span><span class="days-badge ${cls}">${d} дн</span></div>
                ${c.comment ? `<div style="font-size:.75rem;color:#888">💬 ${c.comment}</div>` : ''}</div>`;
        });
    }
    document.getElementById('inactiveList').innerHTML = h;
    addSwipeListeners('inactiveList');
}