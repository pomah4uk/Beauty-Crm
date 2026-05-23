// ===== РЕНДЕР УСЛУГ =====

import { data } from '../data.js';
import { addSwipeListeners } from './swipe.js';

export function renderServices() {
    let h = '';
    data.services.forEach(s => {
        h += `<div class="card swipe-card pad12 mb8" style="cursor:pointer" data-id="${s.id}" data-type="service" onclick="window.editService(${s.id})">
            <div class="card-header"><span class="card-name"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${s.color};margin-right:6px"></span>${s.name}</span><span style="font-size:.85rem;color:#666">${s.price?s.price+'₽':'без цены'}</span></div></div>`;
    });
    document.getElementById('servicesList').innerHTML = h || '<div style="text-align:center;color:#999;padding:20px">Нет услуг</div>';
    addSwipeListeners('servicesList');
}