// ===== МОДАЛКИ =====

import { data, nextId, clientPhone, todayStr, updateLastVisit, save } from './data.js';
import { toast, show, hide, copyPhone, callPhone } from './utils.js';
import { setPage } from './router.js';
import { renderHistory, renderServices } from './render.js';

let editClientId = null;
let editServiceId = null;
let statsClientId = null;
let editRecordId = null;

window.editClientId = null;
window.editServiceId = null;
window.statsClientId = null;
window.editRecordId = null;

const COLORS = ['#e74c3c','#f39c12','#3498db','#27ae60','#9b59b6','#1abc9c','#e67e22','#95a5a6'];

// ===== МОДАЛКА КЛИЕНТА =====
export function openClientModal() {
    editClientId = null;
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientBirth').value = '';
    document.getElementById('clientModalTitle').innerText = '➕ Клиент';
    show('clientModal');
}

document.getElementById('saveClientBtn').onclick = function() {
    let name = document.getElementById('clientName').value.trim();
    if (!name) return alert('Введите имя');
    let c = {
        id: editClientId || nextId(data.clients),
        name,
        phone: document.getElementById('clientPhone').value,
        birth: document.getElementById('clientBirth').value,
        lastDate: '',
        lastService: ''
    };
    if (editClientId) {
        let i = data.clients.findIndex(x => x.id === editClientId);
        if (i !== -1) data.clients[i] = c;
    } else {
        data.clients.push(c);
    }
    save();
    hide('clientModal');
};

document.getElementById('cancelClientBtn').onclick = function() {
    hide('clientModal');
};

// ===== МОДАЛКА ЗАПИСИ =====
export function openRecordModal(clientId) {
    editRecordId = null;
    let sel = document.getElementById('recordClientSelect');
    sel.innerHTML = '<option value="">-- Выберите --</option><option value="__new__">+ Новый клиент</option>';
    data.clients.forEach(c => {
        let o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.name;
        if (c.id === clientId) o.selected = true;
        sel.appendChild(o);
    });
    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = clientId ? 'flex' : 'none';
    document.getElementById('newClientName').value = '';
    document.getElementById('newClientPhone').value = '';
    document.getElementById('recordDate').value = todayStr();
    document.getElementById('recordDate').setAttribute('min', todayStr());
    document.getElementById('recordTime').value = '12:00';
    document.getElementById('servicesContainer').innerHTML = '';
    addServiceRow('');
    updateTotal();
    if (clientId) updateCallLink();
    show('recordModal');
}

document.getElementById('recordClientSelect').onchange = function() {
    let v = this.value;
    if (v === '__new__') {
        document.getElementById('newClientFields').classList.remove('hidden');
        document.getElementById('callLinkRow').style.display = 'none';
    } else if (v) {
        document.getElementById('newClientFields').classList.add('hidden');
        document.getElementById('callLinkRow').style.display = 'flex';
        updateCallLink();
    } else {
        document.getElementById('newClientFields').classList.add('hidden');
        document.getElementById('callLinkRow').style.display = 'none';
    }
};

function updateCallLink() {
    let p = clientPhone(parseInt(document.getElementById('recordClientSelect').value));
    let l = document.getElementById('callClientLink');
    if (p) {
        l.href = 'tel:' + p;
        l.style.display = 'inline';
    } else {
        l.href = '#';
        l.style.display = 'none';
    }
}

function addServiceRow(name) {
    let container = document.getElementById('servicesContainer');
    let row = document.createElement('div');
    row.className = 'service-row';

    let sel = document.createElement('select');
    sel.className = 'modal-select';
    sel.style.marginBottom = '0';

    data.services.forEach(v => {
        let o = document.createElement('option');
        o.value = v.name;
        o.textContent = v.name + (v.price ? ` (${v.price}₽)` : '');
        o.dataset.price = v.price || 0;
        if (v.name === name) o.selected = true;
        sel.appendChild(o);
    });
    sel.onchange = updateTotal;

    let btn = document.createElement('button');
    btn.className = 'small-btn';
    btn.style.flexShrink = '0';
    btn.textContent = '✕';
    btn.onclick = function() {
        row.remove();
        updateTotal();
    };

    row.appendChild(sel);
    row.appendChild(btn);
    container.appendChild(row);
    updateTotal();
}

function updateTotal() {
    let t = 0;
    document.querySelectorAll('#servicesContainer select').forEach(s => {
        let o = s.options[s.selectedIndex];
        if (o && o.dataset.price) t += parseInt(o.dataset.price) || 0;
    });
    document.getElementById('recordPrice').value = t;
    document.getElementById('recordTotalDisplay').innerText = t;
}

document.getElementById('addServiceRowBtn').onclick = function() {
    addServiceRow('');
};

document.getElementById('saveRecordBtn').onclick = function() {
    let v = document.getElementById('recordClientSelect').value;
    let cid;

    if (v === '__new__') {
        let n = document.getElementById('newClientName').value.trim();
        if (!n) return alert('Введите имя');
        let c = {
            id: nextId(data.clients),
            name: n,
            phone: document.getElementById('newClientPhone').value,
            birth: '',
            lastDate: '',
            lastService: ''
        };
        data.clients.push(c);
        cid = c.id;
    } else {
        cid = parseInt(v);
        if (!cid) return alert('Выберите клиента');
    }

    if (document.getElementById('recordDate').value < todayStr()) return alert('Нельзя задним числом!');

    let names = [];
    document.querySelectorAll('#servicesContainer select').forEach(s => {
        if (s.value) names.push(s.value);
    });
    if (!names.length) return alert('Выберите услугу');

    let timeVal = document.getElementById('recordTime').value || '12:00';
    let r = {
        id: editRecordId || nextId(data.records),
        clientId: cid,
        date: document.getElementById('recordDate').value,
        time: timeVal,
        service: names.join(' + '),
        price: parseInt(document.getElementById('recordPrice').value) || 0,
        status: 'active'
    };

    if (editRecordId) {
        let i = data.records.findIndex(x => x.id === editRecordId);
        if (i !== -1) data.records[i] = r;
        editRecordId = null;
    } else {
        data.records.push(r);
    }

    save();
    hide('recordModal');
};

document.getElementById('cancelRecordBtn').onclick = function() {
    editRecordId = null;
    hide('recordModal');
};

// ===== РЕДАКТИРОВАНИЕ ЗАПИСИ =====
export function editRecord(id) {
    let r = data.records.find(x => x.id === id);
    if (!r || r.status !== 'active') return;

    let sel = document.getElementById('recordClientSelect');
    sel.innerHTML = '';
    data.clients.forEach(c => {
        let o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.name;
        if (c.id === r.clientId) o.selected = true;
        sel.appendChild(o);
    });

    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = 'flex';
    updateCallLink();
    document.getElementById('recordDate').value = r.date;
    document.getElementById('recordDate').setAttribute('min', todayStr());
    document.getElementById('recordTime').value = r.time || '12:00';
    document.getElementById('servicesContainer').innerHTML = '';

    let servicesList = r.service.split(' + ');
    servicesList.forEach(svc => addServiceRow(svc));
    updateTotal();
    document.getElementById('recordPrice').value = r.price;
    document.getElementById('recordTotalDisplay').innerText = r.price;

    editRecordId = id;
    show('recordModal');
}

// ===== ВЫПОЛНЕНИЕ / ОТМЕНА =====
export function completeRecord(id) {
    let r = data.records.find(x => x.id === id);
    if (r && r.status === 'active') {
        r.status = 'completed';
        updateLastVisit(r.clientId);
        save();
        toast('✅ Выполнено');
    }
}

export function cancelRecord(id) {
    if (confirm('Отменить?')) {
        let r = data.records.find(x => x.id === id);
        if (r) {
            r.status = 'cancelled';
            updateLastVisit(r.clientId);
            save();
            toast('❌ Отменено');
        }
    }
}

// ===== МОДАЛКА РАСХОДА =====
export function openExpenseModal() {
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseComment').value = '';
    show('expenseModal');
}

document.getElementById('saveExpenseBtn').onclick = function() {
    let a = parseInt(document.getElementById('expenseAmount').value);
    if (!a || a <= 0) return alert('Введите сумму');
    data.expenses.push({
        id: nextId(data.expenses),
        amount: a,
        comment: document.getElementById('expenseComment').value || 'Без комментария',
        date: todayStr()
    });
    save();
    hide('expenseModal');
};

document.getElementById('cancelExpenseBtn').onclick = function() {
    hide('expenseModal');
};

// ===== МОДАЛКА УСЛУГИ =====
export function openServiceModal() {
    editServiceId = null;
    document.getElementById('serviceName').value = '';
    document.getElementById('servicePrice').value = '';
    document.getElementById('serviceColor').value = '#3498db';
    document.getElementById('serviceModalTitle').innerText = '➕ Услуга';
    show('serviceModal');
}

export function editService(id) {
    let s = data.services.find(x => x.id === id);
    if (s) {
        document.getElementById('serviceName').value = s.name;
        document.getElementById('servicePrice').value = s.price || '';
        document.getElementById('serviceColor').value = s.color || '#3498db';
        editServiceId = id;
        document.getElementById('serviceModalTitle').innerText = '✏️ Услуга';
        show('serviceModal');
    }
}

document.getElementById('saveServiceBtn').onclick = function() {
    let n = document.getElementById('serviceName').value.trim();
    if (!n) return alert('Введите название');
    let s = {
        id: editServiceId || nextId(data.services),
        name: n,
        price: parseInt(document.getElementById('servicePrice').value) || 0,
        color: document.getElementById('serviceColor').value
    };
    if (editServiceId) {
        let i = data.services.findIndex(x => x.id === editServiceId);
        if (i !== -1) data.services[i] = s;
    } else {
        data.services.push(s);
    }
    save();
    hide('serviceModal');
};

document.getElementById('cancelServiceBtn').onclick = function() {
    hide('serviceModal');
};

// ===== УДАЛЕНИЕ =====
export function deleteRecord(id) {
    if (confirm('Удалить запись?')) {
        data.records = data.records.filter(r => r.id !== id);
        save();
    }
}

export function deleteExpense(id) {
    if (confirm('Удалить расход?')) {
        data.expenses = data.expenses.filter(e => e.id !== id);
        save();
    }
}

export function deleteService(id) {
    if (confirm('Удалить услугу?')) {
        data.services = data.services.filter(s => s.id !== id);
        save();
    }
}

// ===== СТАТИСТИКА КЛИЕНТА =====
export function showClientStats(id) {
    let c = data.clients.find(x => x.id === id);
    if (!c) return;
    statsClientId = id;

    let all = data.records.filter(r => r.clientId === id);
    let done = all.filter(r => r.status === 'completed').length;
    let canc = all.filter(r => r.status === 'cancelled').length;
    let t = done + canc;
    let p = t ? Math.round(done / t * 100) : 0;
    let sum = all.filter(r => r.status === 'completed').reduce((s, r) => s + (r.price || 0), 0);

    document.getElementById('clientStatsContent').innerHTML = `
        <div class="card">
            <div class="card-row"><span>👤</span><span>${c.name}</span></div>
            <div class="card-row"><span>📞</span><span>${c.phone||'—'}</span></div>
            <div class="card-row"><span>🎂</span><span>${c.birth||'—'}</span></div>
            <div class="card-row"><span>✅</span><span>${done}</span></div>
            <div class="card-row"><span>❌</span><span>${canc}</span></div>
            <div class="card-row"><span>📊</span><span>${t}</span></div>
            <div class="card-row"><span>⭐</span><span>${p}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div>
            <div class="card-row"><span>💰</span><span>${sum}₽</span></div>
        </div>`;

    document.getElementById('clientStatsTitle').innerText = 'Статистика: ' + c.name;
    show('clientStatsModal');
}

document.getElementById('closeStatsBtn').onclick = function() {
    hide('clientStatsModal');
};

document.getElementById('createRecordForClientBtn').onclick = function() {
    if (!statsClientId) return;
    hide('clientStatsModal');
    openRecordModal(statsClientId);
};

document.getElementById('editClientFromStatsBtn').onclick = function() {
    if (!statsClientId) return;
    let c = data.clients.find(x => x.id === statsClientId);
    if (!c) return;
    hide('clientStatsModal');
    document.getElementById('clientName').value = c.name;
    document.getElementById('clientPhone').value = c.phone || '';
    document.getElementById('clientBirth').value = c.birth || '';
    editClientId = statsClientId;
    document.getElementById('clientModalTitle').innerText = '✏️ Клиент';
    show('clientModal');
};

document.getElementById('deleteClientFromStatsBtn').onclick = function() {
    if (!statsClientId) return;
    if (confirm('Удалить клиента и все записи?')) {
        data.clients = data.clients.filter(x => x.id !== statsClientId);
        data.records = data.records.filter(r => r.clientId !== statsClientId);
        statsClientId = null;
        hide('clientStatsModal');
        save();
    }
};

// ===== МОДАЛКА ДНЕЙ =====
export function openInactiveModal() {
    document.getElementById('inactiveDaysInput').value = data.inactiveDays;
    show('inactiveDaysModal');
}

document.getElementById('saveInactiveDaysBtn').onclick = function() {
    let v = parseInt(document.getElementById('inactiveDaysInput').value);
    if (v && v >= 1) {
        data.inactiveDays = v;
        save();
    }
    hide('inactiveDaysModal');
};

document.getElementById('cancelInactiveDaysBtn').onclick = function() {
    hide('inactiveDaysModal');
};

// ===== ЭКСПОРТ / ИМПОРТ / СБРОС =====
export function exportData() {
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = 'crm_' + Date.now() + '.json';
    a.click();
    toast('💾 Бэкап сохранён');
}

export function importData(file) {
    let r = new FileReader();
    r.onload = function(ev) {
        try {
            let imported = JSON.parse(ev.target.result);
            data.clients = imported.clients || [];
            data.records = imported.records || [];
            data.expenses = imported.expenses || [];
            data.services = imported.services || [{ id: 1, name: 'Консультация', price: 0, color: '#3498db' }];
            data.inactiveDays = imported.inactiveDays || 30;
            save();
            toast('✅ Восстановлено');
        } catch (e) {
            toast('❌ Ошибка файла');
        }
    };
    r.readAsText(file);
}

export function resetData() {
    if (confirm('Удалить всё?')) {
        data.clients = [];
        data.records = [];
        data.expenses = [];
        data.services = [{ id: 1, name: 'Консультация', price: 0, color: '#3498db' }];
        data.inactiveDays = 30;
        save();
        toast('🗑️ Удалено');
    }
}