// ===== РЕНДЕРЫ СТРАНИЦ =====

import { data, clientName, clientPhone, todayStr, daysSince, updateLastVisit, monthExp, save, getServiceColor } from './data.js';
import { toast, copyPhone, callPhone, confirmModal } from './utils.js';

// ===== ПЕРИОД =====
let currentPeriod = 'month';
let currentDate = new Date();

export function setPeriod(period) {
    currentPeriod = period;
    currentDate = new Date();
    document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`.period-tab[data-period="${period}"]`)?.classList.add('active');
    renderDashboard();
}

export function shiftPeriod(dir) {
    if (currentPeriod === 'day') currentDate.setDate(currentDate.getDate() + dir);
    else if (currentPeriod === 'month') currentDate.setMonth(currentDate.getMonth() + dir);
    else currentDate.setFullYear(currentDate.getFullYear() + dir);
    renderDashboard();
}

// ===== ГЛАВНАЯ =====
export function renderDashboard() {
    let n = currentDate;
    let m = n.getMonth(), y = n.getFullYear();
    
    let periodRecords;
    let periodLabel;
    
    if (currentPeriod === 'day') {
        let dateStr = n.toISOString().slice(0, 10);
        periodRecords = data.records.filter(r => r.status === 'completed' && r.date === dateStr);
        periodLabel = n.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
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

    // Календарь
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
                h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" onclick="window.editRecord(${r.id})">
                    <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
                    <div class="flex end gap12">${p?`<button class="call-btn" onclick="event.stopPropagation();window.callPhone('${p}')">📞</button>`:''}<button class="small-btn" onclick="event.stopPropagation();window.editRecord(${r.id})" style="background:#f39c12;color:#fff">✏️</button></div></div>`;
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
            let cid = c.id, cphone = c.phone || '';
            h += `<div class="card pad12 mb8" style="cursor:pointer" onclick="window.showClientStats(${cid})">
                <div class="flex between mb8" style="pointer-events:none"><span class="card-name">${c.name}</span><span class="days-badge ${cls}">${d} дн</span></div>
                <div class="flex end gap12">${cphone?`<button class="copy-btn" onclick="event.stopPropagation();window.copyPhone('${cphone}')">📋</button><button class="call-btn" onclick="event.stopPropagation();window.callPhone('${cphone}')">📞</button>`:'<span style="font-size:.7rem;color:#999">Нет телефона</span>'}</div></div>`;
        });
    }
    document.getElementById('inactiveList').innerHTML = h;
}

function addSwipeListeners(elId) {
    let container = document.getElementById(elId);
    if (!container) return;
    container.querySelectorAll('.swipe-card').forEach(card => {
        let startX = 0, currentX = 0, moved = false;
        let bgLeft, bgRight;

        bgLeft = document.createElement('div');
        bgLeft.className = 'swipe-bg swipe-bg-left';
        bgLeft.textContent = '✅';
        card.appendChild(bgLeft);

        bgRight = document.createElement('div');
        bgRight.className = 'swipe-bg swipe-bg-right';
        bgRight.textContent = '❌';
        card.appendChild(bgRight);

        card.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            currentX = startX;
            moved = false;
            card.style.transition = 'none';
        });

        card.addEventListener('touchmove', function(e) {
            e.preventDefault();
            currentX = e.touches[0].clientX;
            let diff = currentX - startX;
            if (Math.abs(diff) > 10) {
                moved = true;
                card.style.transform = `translateX(${diff}px)`;
                if (diff > 0) {
                    bgLeft.classList.add('show');
                    bgRight.classList.remove('show');
                } else {
                    bgRight.classList.add('show');
                    bgLeft.classList.remove('show');
                }
            }
        }, { passive: false });

        card.addEventListener('touchend', async function() {
            let diff = currentX - startX;
            card.style.transition = 'transform 0.2s ease';
            card.style.transform = '';
            bgLeft.classList.remove('show');
            bgRight.classList.remove('show');

            if (!moved || Math.abs(diff) < 80) return;

            let id = parseInt(card.dataset.id);
            if (diff > 0) {
                let ok = await confirmModal('✅ Подтвердить выполнение?');
                if (ok) window.completeRecord(id);
            } else {
                window.cancelRecord(id);
            }
        });
    });
}

// ===== КЛИЕНТЫ =====
export function renderClients() {
    let s = document.getElementById('clientSearch').value.toLowerCase();
    let h = '';
    data.clients.filter(c => c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s))).forEach(c => {
        let all = data.records.filter(r => r.clientId === c.id);
        let done = all.filter(r => r.status === 'completed').length;
        let canc = all.filter(r => r.status === 'cancelled').length;
        let t = done + canc, p = t ? Math.round(done / t * 100) : 0;
        h += `<div class="card" onclick="window.showClientStats(${c.id})"><div class="card-header"><span class="card-name">${c.name}</span><span style="font-size:.7rem;color:#999">ID:${c.id}</span></div><div class="card-row"><span>📞</span><span>${c.phone||'—'}</span></div><div class="card-row"><span>🎂</span><span>${c.birth||'—'}</span></div><div class="card-row"><span>📅</span><span>${c.lastDate||'—'}</span></div><div class="card-row"><span>💉</span><span>${c.lastService||'—'}</span></div><div class="card-row"><span>⭐ Рейтинг</span><span>${p}% (${done}/${t})</span></div><div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div></div>`;
    });
    document.getElementById('clientsList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет клиентов</div>';
}

// ===== АКТИВНЫЕ ЗАПИСИ =====
export function renderActive() {
    let s = document.getElementById('recordsSearch').value.toLowerCase();
    let h = '';
    data.records.filter(r => r.status === 'active' && clientName(r.clientId).toLowerCase().includes(s)).forEach(r => {
        let p = clientPhone(r.clientId);
        let color = getServiceColor(r.service?.split(' + ')[0]);
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer;border-left:4px solid ${color}" data-id="${r.id}" onclick="window.editRecord(${r.id})">
            <div class="flex between mb8"><span class="card-name">${clientName(r.clientId)}</span><span style="font-size:.85rem;color:#666">${r.time||'12:00'} — ${r.service||'—'}</span></div>
            <div class="flex end gap12">${p?`<button class="call-btn" onclick="event.stopPropagation();window.callPhone('${p}')">📞</button>`:''}<button class="small-btn" onclick="event.stopPropagation();window.editRecord(${r.id})" style="background:#f39c12;color:#fff">✏️</button></div></div>`;
    });
    document.getElementById('recordsList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет активных записей</div>';
    addSwipeListeners('recordsList');
}

// ===== ИСТОРИЯ =====
export function renderHistory() {
    let s = document.getElementById('historySearch').value.toLowerCase();
    let f = document.querySelector('input[name="histFilter"]:checked')?.value || 'all';
    let h = '';
    data.records.filter(r => (r.status === 'completed' || r.status === 'cancelled') && clientName(r.clientId).toLowerCase().includes(s) && (f === 'all' || r.status === f)).forEach(r => {
        let st = r.status === 'completed' ? '✅ Выполнена' : '❌ Отменена';
        let sc = r.status === 'completed' ? 'badge-green' : 'badge-red';
        h += `<div class="card"><div class="card-header"><span class="card-name">${clientName(r.clientId)}</span><span class="status-badge ${sc}">${st}</span></div><div class="card-row"><span>📅</span><span>${r.date||'—'} ${r.time||'12:00'}</span></div><div class="card-row"><span>💉</span><span>${r.service||'—'}</span></div><div class="card-row"><span>💰</span><span>${r.price?r.price+'₽':'—'}</span></div><div class="card-actions"><button class="small-btn" onclick="event.stopPropagation();window.deleteRecord(${r.id})">🗑️</button></div></div>`;
    });
    document.getElementById('historyList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет записей</div>';
}

// ===== РАСХОДЫ =====
export function renderExpenses() {
    let h = '';
    [...data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(e => {
        h += `<div class="card"><div class="card-row"><span>📅</span><span>${e.date||'—'}</span></div><div class="card-row"><span>💰</span><span>${e.amount}₽</span></div><div class="card-row"><span>📝</span><span>${e.comment||'—'}</span></div><div class="card-actions"><button class="small-btn" onclick="event.stopPropagation();window.deleteExpense(${e.id})">🗑️</button></div></div>`;
    });
    document.getElementById('expensesList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет расходов</div>';
}

// ===== УСЛУГИ =====
export function renderServices() {
    let h = '';
    data.services.forEach(s => {
        h += `<div class="card"><div class="card-header"><span class="card-name"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${s.color};margin-right:6px"></span>${s.name}</span><span style="font-size:.85rem;color:#666">${s.price?s.price+'₽':'без цены'}</span></div><div class="card-actions"><button class="small-btn" onclick="event.stopPropagation();window.editService(${s.id})">✏️</button><button class="small-btn" onclick="event.stopPropagation();window.deleteService(${s.id})">🗑️</button></div></div>`;
    });
    document.getElementById('servicesList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет услуг</div>';
}