/**
 * Carrinho Brasa Burguer — mesmo contrato do Marmitex (localStorage key: cart)
 */
(function (w) {
  'use strict';

  function getCart() {
    try {
      var cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (typeof updateCartDisplay === 'function') updateCartDisplay();
  }

  function money(n) {
    return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
  }

  function ensureCartUI() {
    if (document.getElementById('confirmModal')) return;

    var modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.innerHTML =
      '<div class="confirm-modal-content">' +
      '  <div class="confirm-modal-header">' +
      '    <div class="confirm-modal-icon">' +
      '      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
      '    </div>' +
      '    <h2>Adicionado à sacola!</h2>' +
      '  </div>' +
      '  <div class="confirm-modal-body">' +
      '    <div class="confirm-modal-buttons">' +
      '      <button type="button" class="confirm-btn confirm-btn-primary" id="brasaFinishOrder">Conferir e Finalizar</button>' +
      '      <button type="button" class="confirm-btn confirm-btn-secondary" id="brasaContinueShop">Continuar Comprando</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);

    var bag = document.createElement('div');
    bag.id = 'shopping-cart-container';
    bag.innerHTML =
      '<div id="cart-content">' +
      '  <div id="cart-expanded" style="display:none">' +
      '    <div style="padding:16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0f0f0;background:#f8f9fa">' +
      '      <h3 style="font-weight:600;font-size:18px;color:#333;margin:0">Minha Sacola</h3>' +
      '      <button type="button" id="cart-collapse-btn" style="background:none;border:none;color:#666;cursor:pointer;padding:8px;font-size:18px">▾</button>' +
      '    </div>' +
      '    <div id="cart-items-list" style="padding:16px;max-height:300px;overflow-y:auto"></div>' +
      '    <div style="padding:16px;background:#f8f9fa;border-top:1px solid #f0f0f0">' +
      '      <div style="display:flex;justify-content:space-between;font-weight:600;color:#333;margin-bottom:16px">' +
      '        <span>Total</span><span id="cart-total-expanded" style="font-size:20px;color:#111">R$ 0,00</span>' +
      '      </div>' +
      '      <button type="button" id="brasaGoCart" style="width:100%;background:#22c55e;color:#052e16;font-weight:700;padding:14px;border-radius:12px;border:none;cursor:pointer;font-size:15px">Finalizar Pedido</button>' +
      '    </div>' +
      '  </div>' +
      '  <div id="cart-collapsed">' +
      '    <div style="display:flex;align-items:center;gap:12px">' +
      '      <span id="cart-item-count-collapsed">0</span>' +
      '      <span style="font-weight:600;font-size:15px">Ver sacola</span>' +
      '    </div>' +
      '    <span id="cart-total-collapsed" style="font-weight:600;font-size:18px">R$ 0,00</span>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(bag);

    document.getElementById('brasaFinishOrder').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      w.location.href = '/carrinho/';
    });
    document.getElementById('brasaContinueShop').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeConfirmModal();
      // Continuar comprando = voltar ao cardápio
      w.location.href = '/';
    });
    document.getElementById('brasaGoCart').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      w.location.href = '/carrinho/';
    });
    document.getElementById('cart-collapse-btn').onclick = toggleCartExpanded;
    document.getElementById('cart-collapsed').onclick = toggleCartExpanded;
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeConfirmModal();
    });
  }

  var isCartExpanded = false;

  function toggleCartExpanded() {
    isCartExpanded = !isCartExpanded;
    var expanded = document.getElementById('cart-expanded');
    var collapsed = document.getElementById('cart-collapsed');
    if (!expanded || !collapsed) return;
    if (isCartExpanded) {
      expanded.style.display = 'block';
      collapsed.style.display = 'none';
    } else {
      expanded.style.display = 'none';
      collapsed.style.display = 'flex';
    }
  }

  function isProductPage() {
    return /\/produtos\//.test(w.location.pathname || '');
  }

  function updateCartDisplay() {
    ensureCartUI();
    var cart = getCart();
    var container = document.getElementById('shopping-cart-container');
    var itemsList = document.getElementById('cart-items-list');
    var totalExpanded = document.getElementById('cart-total-expanded');
    var totalCollapsed = document.getElementById('cart-total-collapsed');
    var countCollapsed = document.getElementById('cart-item-count-collapsed');
    if (!container) return;

    // Em /produtos/ a barra "Ver sacola" cobria o botão ADICIONAR À SACOLA (z-index)
    var hideBag = !cart.length || isProductPage();
    if (hideBag) {
      container.classList.remove('visible');
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
    } else {
      container.classList.add('visible');
      container.style.visibility = '';
      container.style.pointerEvents = '';
    }

    if (!cart.length) return;

    var total = 0;
    var totalItems = 0;
    itemsList.innerHTML = '';
    cart.forEach(function (item, index) {
      total += Number(item.total || 0);
      totalItems += Number(item.quantity || 1);
      var el = document.createElement('div');
      el.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px;background:#f8f9fa;border-radius:10px;margin-bottom:8px';
      var img = item.image
        ? '<img src="' + item.image + '" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.style.display=\'none\'">'
        : '';
      el.innerHTML =
        img +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-weight:600;color:#333;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        item.quantity + 'x ' + item.name +
        '</div>' +
        '<div style="font-size:12px;color:#999">' + money(item.price) + '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">' +
        '<span style="font-weight:600;color:#111;font-size:13.5px">' + money(item.total) + '</span>' +
        '<button type="button" data-idx="' + index + '" class="brasa-remove-item" style="background:#f0f0f0;color:#999;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;font-size:14px;line-height:1" title="Remover">×</button>' +
        '</div>';
      itemsList.appendChild(el);
    });

    itemsList.querySelectorAll('.brasa-remove-item').forEach(function (btn) {
      btn.onclick = function (e) {
        e.stopPropagation();
        removeFromCart(parseInt(btn.getAttribute('data-idx'), 10));
      };
    });

    var tf = money(total);
    totalExpanded.textContent = tf;
    totalCollapsed.textContent = tf;
    countCollapsed.textContent = String(totalItems);
  }

  function removeFromCart(index) {
    var cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    if (!cart.length) isCartExpanded = false;
  }

  function openConfirmModal() {
    ensureCartUI();
    var bag = document.getElementById('shopping-cart-container');
    if (bag) {
      bag.style.visibility = 'hidden';
      bag.style.pointerEvents = 'none';
    }
    document.getElementById('confirmModal').classList.add('active');
  }

  function closeConfirmModal() {
    var m = document.getElementById('confirmModal');
    if (m) m.classList.remove('active');
    try {
      if (typeof jQuery !== 'undefined') {
        jQuery('#modalCarregando').hide();
        jQuery('#opacidade').removeClass('opacidade');
        jQuery('body').css('overflow-y', 'auto');
      }
    } catch (e) {}
    document.body.style.overflow = '';
    updateCartDisplay();
  }

  function collectExtras() {
    var parts = [];
    document.querySelectorAll('#detalhesProduto .opcoes').forEach(function (op) {
      var q = op.querySelector('.qtdeOpcao');
      var qty = q ? parseInt(q.value, 10) || 0 : 0;
      if (qty <= 0) return;
      var nomeEl = op.querySelector('.nome b') || op.querySelector('b');
      var nome = nomeEl ? nomeEl.textContent.trim() : 'Extra';
      parts.push(qty + 'x ' + nome);
    });
    return parts;
  }

  function buildItemFromProductPage() {
    var nome = '';
    var h = document.querySelector('#detalhesProduto h3');
    if (h) nome = h.textContent.trim();

    var valor = 0;
    var hidden = document.querySelector('#detalhesProduto span.preco span[style*="display:none"]');
    if (hidden) valor = parseFloat(hidden.textContent) || 0;
    if (!valor) {
      var precoEl = document.querySelector('#detalhesProduto .preco');
      if (precoEl) {
        var m = precoEl.textContent.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
        valor = parseFloat(m) || 0;
      }
    }

    var imgEl = document.querySelector('#detalhesProduto .fotoProduto img');
    var image = imgEl ? imgEl.getAttribute('src') : '';
    if (image && image.indexOf('../') === 0) image = image.replace('../../', '/');
    if (image && image.charAt(0) !== '/' && image.indexOf('http') !== 0) image = '/' + image;

    var obsEl = document.querySelector('#detalhesProduto input.observacao');
    var observation = obsEl ? (obsEl.value || '').trim() : '';
    var extras = collectExtras();
    if (extras.length) {
      observation = (observation ? observation + ' | ' : '') + 'Extras: ' + extras.join(', ');
    }

    var qty = 1;
    var qtyInput = document.querySelector('#detalhesProduto input.qtde');
    if (qtyInput) qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);

    var comboMatch = location.pathname.match(/combo(\d+)/);
    var productId = comboMatch ? 'combo' + comboMatch[1] : String(Date.now());

    return {
      id: Date.now(),
      productId: productId,
      name: nome,
      image: image,
      price: valor,
      quantity: qty,
      options: { extras: extras },
      observation: observation,
      total: valor * qty
    };
  }

  function addProductPageToCart() {
    var item = buildItemFromProductPage();
    if (!item.name || !item.price) {
      alert('Não foi possível adicionar este produto.');
      return;
    }
    var cart = getCart();
    cart.push(item);
    saveCart(cart);

    if (typeof fbq !== 'undefined') {
      fbq('track', 'AddToCart', {
        content_name: item.name,
        content_ids: [item.productId || item.id],
        content_type: 'product',
        value: item.total,
        currency: 'BRL'
      });
    }
    if (typeof gtag === 'function') {
      gtag('event', 'add_to_cart', {
        currency: 'BRL',
        value: item.total,
        items: [{ item_name: item.name, price: item.price, quantity: item.quantity }]
      });
    }

    openConfirmModal();
  }

  // API global
  w.getCart = getCart;
  w.saveCart = saveCart;
  w.updateCartDisplay = updateCartDisplay;
  w.removeFromCart = removeFromCart;
  w.openConfirmModal = openConfirmModal;
  w.closeConfirmModal = closeConfirmModal;
  w.toggleCartExpanded = toggleCartExpanded;
  w.goToCheckout = function () { w.location.href = '/carrinho/'; };
  w.addProductPageToCart = addProductPageToCart;
  w.finishOrder = function () { w.location.href = '/carrinho/'; };

  document.addEventListener('DOMContentLoaded', function () {
    ensureCartUI();
    updateCartDisplay();
  });
})(window);
