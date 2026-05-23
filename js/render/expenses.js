// ===== РЕНДЕР РАСХОДОВ =====

import { data } from '../data.js';
import { addSwipeListeners } from './swipe.js';

export function renderExpenses() {
    let h = '';
    [...data.expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(e => {
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${e.id}" data-type="expense" onclick="window.editExpense(${e.id})">
            <div class="card-row"><span>📅</span><span>${e.date||'—'}</span></div>
            <div class="card-row"><span>💰</span><span>${e.amount}₽</span></div>
            <div class="card-row"><span>📝</span><span>${e.comment||'—'}</span></div></div>`;
    });
    document.getElementById('expensesList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет расходов</div>';
    addSwipeListeners('expensesList');
}