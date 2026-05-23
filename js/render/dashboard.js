// ===== РЕНДЕР ГЛАВНОЙ =====

import { data, clientName, clientPhone, todayStr, daysSince, monthExp, getServiceColor } from '../data.js';
import { callPhone } from '../utils.js';
import { addSwipeListeners } from './swipe.js';

let currentPeriod = 'month';
let currentDate = new Date();

export function getCurrentPeriod() { return currentPeriod; }
export function getCurrentDate() { return currentDate; }

export function setPeriod(period) {
    currentPeriod = period;
    currentDate = new Date(); // всегда сбрасываем на сегодня
    document.querySelectorAll('#periodTabs .period-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`#periodTabs .period-tab[data-period="${period}"]`)?.classList.add('active');
    renderDashboard();
}

export function shiftPeriod(dir) {
    if (currentPeriod === 'day') currentDate.setDate(currentDate.getDate() + dir);
    else if (currentPeriod === 'month') currentDate.setMonth(currentDate.getMonth() + dir);
    else currentDate.setFullYear(currentDate.getFullYear() + dir);
    renderDashboard();
}

export function renderDashboard() {
    let n = currentDate;
    let m = n.getMonth(), y = n.getFullYear();
    
    let periodRecords;
    let periodLabel;
    
    if (currentPeriod === 'day') {
        let dateStr = n.toISOString().slice(0, 10);
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date === dateStr);
        periodLabel = n.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } else if (currentPeriod === 'month') {
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y);
        periodLabel = n.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    } else {
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date && new Date(r.date).getFullYear() === y);
        periodLabel = n.getFullYear().toString();
    }
    
    let rev = periodRecords.reduce((s, r) => s + (r.price || 0), 0);
    
    let exp;
    if (currentPeriod === 'day') {
        exp = data.expenses.filter(e => e.date === n.toISOString().slice(0, 10)).reduce((s, e) => s + e.amount, 0);
    } else if (currentPeriod === 'month') {
        exp = monthExp(m, y);
    } else {
        exp = data.expenses.filter(e => new Date(e.date).getFullYear() === y).reduce((s, e) => s + e.amount, 0);
    }
    
    let canc;
    if (currentPeriod === 'day') {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date === n.toISOString().slice(0, 10)).length;
    } else if (currentPeriod === 'month') {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date && new Date(r.date).getMonth() === m && new Date(r.date).getFullYear() === y).length;
    } else {
        canc = data.records.filter(r => r.status === 'cancelled' && r.date && new Date(r.date).getFullYear() === y).length;
    }
    
    let act = data.records.filter(r => r.status === 'active').length;
    let avg = periodRecords.length ? Math.round(rev / periodRecords.length) : 0;
    let ss = {}; periodRecords.forEach(r => { if (r.service) ss[r.service] = (ss[r.service] || 0) + 1; });
    let top = Object.entries(ss).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    let periodLabelEl = document.getElementById('periodLabel');
    if (periodLabelEl) periodLabelEl.innerText = periodLabel;

    // Календарь сегодня/завтра
    let today = todayStr();
    let tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    let tomorrowStr = tomorrow.toISOString().slice(0, 10);
    document.getElementById('todayDate').innerText = today;
    document.getElementById('tomorrowDate').innerText = tomorrowStr;
    let todayRecords = data.records.filter(r => r.status === 'active' && r.date === today);
    let tomorrowRecords = data.records.filter(r => r.status === 'active' && r.date === tomorrowStr);

    function renderCal(list, elId) {
        let h = '';
        let dayTotal = 0;
        if (!list.length) {
            h = '<div style="text-align:center;color:#999;padding:8px">Нет записей</div>';
        } else {
            list.forEach(r => {
                let p = clientPhone(r.clientId);
                let color = getServiceColor(r.service?.split(' + ')[0]);
                dayTotal += r.price || 0;
                h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" data-type="record-active" onclick="window.editRecord(${r.id})">
                    <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
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

    // Виджеты
    document.getElementById('statTotalClients').innerText = data.clients.length;
    document.getElementById('statActive').innerText = act;
    document.getElementById('statCompleted').innerText = periodRecords.length;
    document.getElementById('statCancelled').innerText = canc;
    document.getElementById('statRevenue').innerText = rev + '₽';
    document.getElementById('statCost').innerText = exp + '₽';
    document.getElementById('statProfit').innerText = (rev - exp) + '₽';
    document.getElementById('statAvgCheck').innerText = avg + '₽';
    document.getElementById('statTopService').innerText = top.length > 15 ? top.slice(0, 15) + '…' : top;
    document.getElementById('inactiveDaysLabel').innerText = data.inactiveDays;

    // Давно не заходили
    let list = data.clients.filter(c => daysSince(c.lastDate) > data.inactiveDays && c.lastDate).sort((a, b) => daysSince(b.lastDate) - daysSince(a.lastDate));
    let h = '';
    if (!list.length) {
        h = '<div style="text-align:center;color:#999;padding:12px">Все активны 👍</div>';
    } else {
        list.forEach(c => {
            let d = daysSince(c.lastDate), cls = d > 60 ? 'days-danger' : 'days-warn';
            let cid = c.id;
            h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${cid}" data-type="inactive" onclick="window.showClientStats(${cid})">
                <div class="flex between mb8"><span class="card-name">${c.name}</span><span class="days-badge ${cls}">${d} дн</span></div></div>`;
        });
    }
    document.getElementById('inactiveList').innerHTML = h;
    addSwipeListeners('inactiveList');
}