// ===== ДАННЫЕ =====
export let data = JSON.parse(localStorage.getItem('data')) || {
    clients: [],
    records: [],
    expenses: [],
    services: [
        { id: 1, name: 'Увеличение губ', price: 8000, color: '#e74c3c' },
        { id: 2, name: 'Увеличение губ 0.5', price: 4000, color: '#f39c12' },
        { id: 3, name: 'Носогубки', price: 7000, color: '#3498db' },
        { id: 4, name: 'Биоревитализация', price: 6000, color: '#27ae60' },
        { id: 5, name: 'Липолитики', price: 5000, color: '#9b59b6' }
    ],
    inactiveDays: 30
};

const listeners = [];

export function onDataChange(fn) {
    listeners.push(fn);
}

export function save() {
    localStorage.setItem('data', JSON.stringify(data));
    listeners.forEach(fn => fn());
}

export function nextId(arr) {
    return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

export function clientName(id) {
    let c = data.clients.find(x => x.id === id);
    return c ? c.name : 'Удалён';
}

export function clientPhone(id) {
    let c = data.clients.find(x => x.id === id);
    return c ? c.phone || '' : '';
}

export function todayStr() {
    let d = new Date();
    return d.getFullYear() + '-' + 
        (''+(d.getMonth()+1)).padStart(2,'0') + '-' + 
        (''+d.getDate()).padStart(2,'0');
}

export function daysSince(d) {
    if (!d) return 9999;
    return Math.floor((new Date() - new Date(d)) / 86400000);
}

export function updateLastVisit(id) {
    let last = data.records
        .filter(r => r.clientId === id && r.status === 'completed')
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    let c = data.clients.find(x => x.id === id);
    if (c) {
        c.lastDate = last ? last.date : '';
        c.lastService = last ? last.service : '';
    }
}

export function monthExp(month, year) {
    let m = month !== undefined ? month : new Date().getMonth();
    let y = year !== undefined ? year : new Date().getFullYear();
    return data.expenses
        .filter(e => {
            let d = new Date(e.date);
            return d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((s, e) => s + e.amount, 0);
}

export function getServiceColor(name) {
    let s = data.services.find(x => x.name === name);
    return s ? s.color || '#95a5a6' : '#95a5a6';
}