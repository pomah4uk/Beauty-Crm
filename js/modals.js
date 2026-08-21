// ===== МОДАЛКИ =====

import { data, nextId, clientPhone, todayStr, updateLastVisit, save } from './data.js';
import { toast, show, hide, callPhone, alertModal, confirmModal } from './utils.js';

let editClientId = null;
let editServiceId = null;
let statsClientId = null;
let editRecordId = null;
let editExpenseId = null;

// ===== МОДАЛКА КЛИЕНТА =====
export function openClientModal() {
    editClientId = null;
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    let commentField = document.getElementById('clientComment');
    if (commentField) commentField.value = '';
    document.getElementById('clientModalTitle').innerText = '➕ Клиент';
    show('clientModal');
}

document.getElementById('saveClientBtn').onclick = function() {
    let name = document.getElementById('clientName').value.trim();
    if (!name) { alertModal('Введите имя'); return; }
    let c = {
        id: editClientId || nextId(data.clients),
        name,
        phone: document.getElementById('clientPhone').value,
        comment: document.getElementById('clientComment')?.value || '',
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
let selectedClientId = null;
let selectedServices = [];

export function openRecordModal(clientId) {
    editRecordId = null;
    selectedServices = [];

    let searchInput = document.getElementById('clientSearchInput');
    searchInput.value = clientId ? (data.clients.find(c => c.id === clientId)?.name || '') : '';
    selectedClientId = clientId || null;

    document.getElementById('clientDropdown').classList.add('hidden');
    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = clientId ? 'flex' : 'none';
    document.getElementById('newClientPhone').value = '';

    document.getElementById('recordDate').value = todayStr();
    document.getElementById('recordDate').setAttribute('min', todayStr());
    document.getElementById('recordTime').value = '12:00';

    document.getElementById('servicesContainer').innerHTML = '';
    document.getElementById('serviceSearchInput').value = '';
    document.getElementById('serviceDropdown').classList.add('hidden');
    document.getElementById('recordComment').value = '';
    let prepaidField = document.getElementById('prepaidInput');
    if (prepaidField) prepaidField.value = '';

    if (clientId) {
        updateCallLink();
        let c = data.clients.find(x => x.id === clientId);
        if (c && c.comment) {
            document.getElementById('clientComment').value = c.comment;
        }
    }

    updateTotal();
    show('recordModal');
}

// Поиск клиента по имени ИЛИ телефону
document.getElementById('clientSearchInput').addEventListener('input', function() {
    let val = this.value.trim().toLowerCase();
    let dropdown = document.getElementById('clientDropdown');

    if (!val) {
        dropdown.classList.add('hidden');
        document.getElementById('newClientFields').classList.add('hidden');
        return;
    }

    let matches = data.clients.filter(c =>
        c.name.toLowerCase().includes(val) ||
        (c.phone && c.phone.includes(val))
    ).slice(0, 5);

    if (matches.length === 0) {
        dropdown.classList.add('hidden');
        document.getElementById('newClientFields').classList.remove('hidden');
        selectedClientId = null;
        document.getElementById('callLinkRow').style.display = 'none';
        let commentField = document.getElementById('clientComment');
        if (commentField) commentField.value = '';
    } else {
        document.getElementById('newClientFields').classList.add('hidden');
        let h = '';
        matches.forEach(c => {
            h += `<div class="client-option" data-id="${c.id}" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid #f0f3f7"
                onmousedown="event.preventDefault(); window.selectClientFromDropdown(${c.id});">
                <span style="font-weight:600">${c.name}</span>
                <span style="font-size:.75rem;color:#999;float:right">${c.phone||''}</span>
            </div>`;
        });
        dropdown.innerHTML = h;
        dropdown.classList.remove('hidden');
    }
});

window.selectClientFromDropdown = function(clientId) {
    let c = data.clients.find(x => x.id === clientId);
    if (!c) return;
    selectedClientId = c.id;
    document.getElementById('clientSearchInput').value = c.name;
    document.getElementById('clientDropdown').classList.add('hidden');
    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = c.phone ? 'flex' : 'none';
    let commentField = document.getElementById('clientComment');
    if (commentField) commentField.value = c.comment || '';
    window._selectedClientId = c.id;
    window._updateCallLink();
};

// Поиск услуги по названию
document.getElementById('serviceSearchInput').addEventListener('input', function() {
    let val = this.value.trim().toLowerCase();
    let dropdown = document.getElementById('serviceDropdown');

    if (!val) {
        dropdown.classList.add('hidden');
        return;
    }

    let matches = data.services.filter(s => s.name.toLowerCase().includes(val)).slice(0, 5);

    if (matches.length === 0) {
        dropdown.classList.add('hidden');
    } else {
        let h = '';
        matches.forEach(s => {
            h += `<div class="service-option" data-id="${s.id}" style="padding:10px 12px;cursor:pointer;border-bottom:1px solid #f0f3f7"
                onmousedown="event.preventDefault(); window.addServiceToRecord(${s.id});">
                <span style="font-weight:600">${s.name}</span>
                <span style="font-size:.75rem;color:#999;float:right">${s.price ? s.price + ' ₽' : ''}</span>
            </div>`;
        });
        dropdown.innerHTML = h;
        dropdown.classList.remove('hidden');
    }
});

window.addServiceToRecord = function(serviceId) {
    let s = data.services.find(x => x.id === serviceId);
    if (!s) return;

    selectedServices.push({ id: s.id, name: s.name, price: s.price });

    document.getElementById('serviceDropdown').classList.add('hidden');
    document.getElementById('serviceSearchInput').value = '';

    renderSelectedServices();
    updateTotal();
};

function renderSelectedServices() {
    let container = document.getElementById('servicesContainer');
    let h = '';
    selectedServices.forEach((s, index) => {
        h += `<div class="service-row" style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="flex:1;font-size:.85rem;">${s.name}</span>
            <input type="number" value="${s.price}" 
                style="width:80px;padding:6px;border:1px solid var(--border);border-radius:8px;text-align:center;font-size:.85rem;background:var(--card);color:var(--text);"
                onchange="window.updateServicePrice(${index}, this.value)">
            <span style="font-size:.8rem;color:var(--sub);">₽</span>
            <button class="small-btn" style="flex-shrink:0;" onclick="window.removeServiceFromRecord(${index})">✕</button>
        </div>`;
    });
    container.innerHTML = h;
}

window.updateServicePrice = function(index, newPrice) {
    let price = parseInt(newPrice) || 0;
    selectedServices[index].price = price;

    let service = data.services.find(s => s.id === selectedServices[index].id);
    if (service) {
        service.price = price;
    }

    updateTotal();
};

window.removeServiceFromRecord = function(index) {
    selectedServices.splice(index, 1);
    renderSelectedServices();
    updateTotal();
};

document.getElementById('addServiceFastBtn').onclick = function() {
    let input = document.getElementById('serviceSearchInput');
    let val = input.value.trim();
    if (!val) { alertModal('Введите название услуги'); return; }

    let newService = {
        id: nextId(data.services),
        name: val,
        price: 0,
        color: '#3498db'
    };
    data.services.push(newService);
    save();

    selectedServices.push({ id: newService.id, name: newService.name, price: newService.price });

    input.value = '';
    document.getElementById('serviceDropdown').classList.add('hidden');

    renderSelectedServices();
    updateTotal();
};

// Быстрое добавление клиента
document.getElementById('addClientFastBtn').onclick = function() {
    let input = document.getElementById('clientSearchInput');
    let name = input.value.trim();
    if (!name) { alertModal('Введите имя клиента'); return; }

    let newClient = {
        id: nextId(data.clients),
        name: name,
        phone: '',
        comment: '',
        lastDate: '',
        lastService: ''
    };
    data.clients.push(newClient);
    save();

    selectedClientId = newClient.id;
    document.getElementById('clientDropdown').classList.add('hidden');
    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = 'none';
    let commentField = document.getElementById('clientComment');
    if (commentField) commentField.value = '';

    updateCallLink();
};

window._selectedClientId = null;
window._updateCallLink = function() {
    selectedClientId = window._selectedClientId;
    updateCallLink();
};

document.addEventListener('click', function(e) {
    if (!e.target.closest('#recordModal')) {
        document.getElementById('clientDropdown').classList.add('hidden');
        document.getElementById('serviceDropdown').classList.add('hidden');
    }
});

function updateCallLink() {
    let p = clientPhone(selectedClientId);
    let l = document.getElementById('callClientLink');
    if (p) {
        l.href = 'tel:' + p;
        l.style.display = 'inline';
    } else {
        l.href = '#';
        l.style.display = 'none';
    }
}

function updateTotal() {
    let t = 0;
    selectedServices.forEach(s => {
        t += parseInt(s.price) || 0;
    });
    document.getElementById('recordPrice').innerText = t;
}

document.getElementById('saveRecordBtn').onclick = function() {
    let cid = selectedClientId;

    if (!cid) {
        let n = document.getElementById('clientSearchInput').value.trim();
        if (!n) { alertModal('Введите имя клиента'); return; }
        let c = {
            id: nextId(data.clients),
            name: n,
            phone: document.getElementById('newClientPhone').value,
            comment: document.getElementById('clientComment')?.value || '',
            lastDate: '',
            lastService: ''
        };
        data.clients.push(c);
        cid = c.id;
    } else {
        let c = data.clients.find(x => x.id === cid);
        if (c) {
            c.comment = document.getElementById('clientComment')?.value || '';
        }
    }

    if (document.getElementById('recordDate').value < todayStr()) {
        alertModal('Нельзя установить дату задним числом!');
        return;
    }

    if (selectedServices.length === 0) {
        alertModal('Добавьте хотя бы одну услугу');
        return;
    }

    let names = selectedServices.map(s => s.name);
    let total = selectedServices.reduce((sum, s) => sum + (parseInt(s.price) || 0), 0);
    let timeVal = document.getElementById('recordTime').value || '12:00';
    let prepaidField = document.getElementById('prepaidInput');
    let prepaid = prepaidField ? (parseInt(prepaidField.value) || 0) : 0;

    let r = {
        id: editRecordId || nextId(data.records),
        clientId: cid,
        date: document.getElementById('recordDate').value,
        time: timeVal,
        service: names.join(' + '),
        price: total,
        prepaid: prepaid,
        paid: 0,
        comment: document.getElementById('recordComment').value || '',
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
    selectedClientId = null;
    selectedServices = [];
};

document.getElementById('cancelRecordBtn').onclick = function() {
    editRecordId = null;
    selectedClientId = null;
    selectedServices = [];
    hide('recordModal');
};

// ===== РЕДАКТИРОВАНИЕ ЗАПИСИ =====
export function editRecord(id) {
    let r = data.records.find(x => x.id === id);
    if (!r || r.status !== 'active') return;

    selectedClientId = r.clientId;
    let c = data.clients.find(x => x.id === r.clientId);

    document.getElementById('clientSearchInput').value = c ? c.name : '';
    document.getElementById('clientDropdown').classList.add('hidden');
    document.getElementById('newClientFields').classList.add('hidden');
    document.getElementById('callLinkRow').style.display = c?.phone ? 'flex' : 'none';
    updateCallLink();

    document.getElementById('recordDate').value = r.date;
    document.getElementById('recordDate').setAttribute('min', todayStr());
    document.getElementById('recordTime').value = r.time || '12:00';

    selectedServices = [];
    let servicesList = (r.service || '').split(' + ').filter(s => s !== '—');
    servicesList.forEach(svc => {
        let service = data.services.find(s => s.name === svc);
        selectedServices.push({
            id: service ? service.id : 0,
            name: svc,
            price: service ? service.price : 0
        });
    });
    renderSelectedServices();
    updateTotal();

    document.getElementById('recordComment').value = r.comment || '';
    document.getElementById('clientComment').value = c?.comment || '';
    let prepaidField = document.getElementById('prepaidInput');
    if (prepaidField) prepaidField.value = r.prepaid || '';

    editRecordId = id;
    show('recordModal');
}

// ===== ВЫПОЛНЕНИЕ / ОТМЕНА =====
export function completeRecord(id) {
    let r = data.records.find(x => x.id === id);
    if (r && r.status === 'active') {
        r.status = 'completed';
        r.paid = r.price;
        updateLastVisit(r.clientId);
        save();
        toast('✅ Выполнено');
    }
}

export async function cancelRecord(id) {
    let ok = await confirmModal('Отменить запись?');
    if (ok) {
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
    editExpenseId = null;
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseComment').value = '';
    show('expenseModal');
}

export function editExpense(id) {
    let e = data.expenses.find(x => x.id === id);
    if (e) {
        document.getElementById('expenseAmount').value = e.amount;
        document.getElementById('expenseComment').value = e.comment || '';
        editExpenseId = id;
        show('expenseModal');
    }
}

document.getElementById('saveExpenseBtn').onclick = function() {
    let a = parseInt(document.getElementById('expenseAmount').value);
    if (!a || a <= 0) { alertModal('Введите сумму'); return; }

    if (editExpenseId) {
        let e = data.expenses.find(x => x.id === editExpenseId);
        if (e) {
            e.amount = a;
            e.comment = document.getElementById('expenseComment').value || 'Без комментария';
            e.date = todayStr();
        }
        editExpenseId = null;
    } else {
        data.expenses.push({
            id: nextId(data.expenses),
            amount: a,
            comment: document.getElementById('expenseComment').value || 'Без комментария',
            date: todayStr()
        });
    }
    save();
    hide('expenseModal');
};

document.getElementById('cancelExpenseBtn').onclick = function() {
    editExpenseId = null;
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
    if (!n) { alertModal('Введите название'); return; }
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
    data.records = data.records.filter(r => r.id !== id);
    save();
}

export function deleteExpense(id) {
    data.expenses = data.expenses.filter(e => e.id !== id);
    save();
}

export function deleteService(id) {
    data.services = data.services.filter(s => s.id !== id);
    save();
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
            <div class="card-row"><span>💬</span><span>${c.comment||'—'}</span></div>
            <div class="card-row"><span>✅</span><span>${done}</span></div>
            <div class="card-row"><span>❌</span><span>${canc}</span></div>
            <div class="card-row"><span>📊</span><span>${t}</span></div>
            <div class="card-row"><span>⭐</span><span>${p}%</span></div>
            <div class="progress-bar"><div class="progress-fill" style="width:${p}%"></div></div>
            <div class="card-row"><span>💰</span><span>${sum}₽</span></div>
        </div>`;

    document.getElementById('clientStatsTitle').innerText = c.name;
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
    let commentField = document.getElementById('clientComment');
    if (commentField) commentField.value = c.comment || '';
    editClientId = statsClientId;
    document.getElementById('clientModalTitle').innerText = '✏️ Клиент';
    show('clientModal');
};

document.getElementById('deleteClientFromStatsBtn').onclick = async function() {
    if (!statsClientId) return;
    let ok = await confirmModal('Удалить клиента и все записи?');
    if (ok) {
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
    let blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'crm_' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
            data.services = imported.services || [];
            data.inactiveDays = imported.inactiveDays || 30;
            save();
            toast('✅ Восстановлено');
        } catch (e) {
            toast('❌ Ошибка файла');
        }
    };
    r.readAsText(file);
}

export async function resetData() {
    let ok = await confirmModal('Удалить все данные? Это необратимо.');
    if (ok) {
        data.clients = [];
        data.records = [];
        data.expenses = [];
        data.services = [];
        data.inactiveDays = 30;
        save();
        toast('🗑️ Данные удалены');
    }
}