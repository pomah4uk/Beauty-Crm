// ===== УНИВЕРСАЛЬНЫЕ СВАЙПЫ =====

import { data, save } from '../data.js';
import { toast, confirmModal, modalActive } from '../utils.js';

export function addSwipeListeners(elId) {
    let container = document.getElementById(elId);
    if (!container) return;
    container.querySelectorAll('.swipe-card').forEach(card => {
        let startX = 0, startY = 0, currentX = 0, moved = false, direction = null;
        let bgLeft, bgRight;
        let type = card.dataset.type;

        bgLeft = document.createElement('div');
        bgLeft.className = 'swipe-bg swipe-bg-left';
        bgRight = document.createElement('div');
        bgRight.className = 'swipe-bg swipe-bg-right';

        if (type === 'record-active') {
            bgLeft.classList.add('swipe-bg-green'); bgLeft.textContent = '✅';
            bgRight.classList.add('swipe-bg-red'); bgRight.textContent = '❌';
        } else if (type === 'history') {
            bgLeft.classList.add('swipe-bg-blue'); bgLeft.textContent = '🔄';
            bgRight.classList.add('swipe-bg-red'); bgRight.textContent = '🗑️';
        } else if (type === 'client') {
            bgLeft.classList.add('swipe-bg-green'); bgLeft.textContent = '📞';
            bgRight.classList.add('swipe-bg-blue'); bgRight.textContent = '📝';
        } else if (type === 'inactive') {
            bgLeft.classList.add('swipe-bg-green'); bgLeft.textContent = '📞';
            bgRight.classList.add('swipe-bg-blue'); bgRight.textContent = '📝';
        } else if (type === 'expense') {
            bgLeft.classList.add('swipe-bg-orange'); bgLeft.textContent = '✏️';
            bgRight.classList.add('swipe-bg-red'); bgRight.textContent = '🗑️';
        } else if (type === 'service') {
            bgLeft.classList.add('swipe-bg-orange'); bgLeft.textContent = '✏️';
            bgRight.classList.add('swipe-bg-red'); bgRight.textContent = '🗑️';
        }

        card.appendChild(bgLeft);
        card.appendChild(bgRight);

        card.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            moved = false;
            direction = null;
            card.style.transition = 'none';
        });

        card.addEventListener('touchmove', function(e) {
            let diffX = e.touches[0].clientX - startX;
            let diffY = e.touches[0].clientY - startY;
            
            if (direction === null && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
                direction = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical';
            }
            
            if (direction === 'vertical') return;
            
            if (direction === 'horizontal') {
                if (e.cancelable) e.preventDefault();
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
            }
        }, { passive: false });

        card.addEventListener('touchend', async function() {
            if (modalActive) return;
            
            let diff = currentX - startX;
            card.style.transition = 'transform 0.2s ease';
            card.style.transform = '';
            bgLeft.classList.remove('show');
            bgRight.classList.remove('show');

            if (!moved || Math.abs(diff) < 80) return;

            let id = parseInt(card.dataset.id);

            if (diff > 0) {
                if (type === 'record-active') {
                    let ok = await confirmModal('✅ Подтвердить выполнение?');
                    if (ok) window.completeRecord(id);
                } else if (type === 'history') {
                    let ok = await confirmModal('🔄 Восстановить запись?');
                    if (ok) { let r = data.records.find(x => x.id === id); if (r) { r.status = 'active'; save(); toast('🔄 Восстановлено'); } }
                } else if (type === 'client') {
                    let c = data.clients.find(x => x.id === id);
                    if (c && c.phone) window.callPhone(c.phone);
                } else if (type === 'inactive') {
                    let c = data.clients.find(x => x.id === id);
                    if (c && c.phone) window.callPhone(c.phone);
                } else if (type === 'expense') {
                    window.editExpense(id);
                } else if (type === 'service') {
                    window.editService(id);
                }
            } else {
                if (type === 'record-active') {
                    window.cancelRecord(id);
                } else if (type === 'history') {
                    let ok = await confirmModal('🗑️ Удалить запись?');
                    if (ok) window.deleteRecord(id);
                } else if (type === 'client') {
                    let ok = await confirmModal('📝 Создать запись для этого клиента?');
                    if (ok) window.openRecordModal(id);
                } else if (type === 'inactive') {
                    let ok = await confirmModal('📝 Создать запись для этого клиента?');
                    if (ok) window.openRecordModal(id);
                } else if (type === 'expense') {
                    let ok = await confirmModal('🗑️ Удалить расход?');
                    if (ok) window.deleteExpense(id);
                } else if (type === 'service') {
                    let ok = await confirmModal('🗑️ Удалить услугу?');
                    if (ok) window.deleteService(id);
                }
            }
        });
    });
}