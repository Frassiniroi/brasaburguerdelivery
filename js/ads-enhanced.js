/**
 * Google Ads Enhanced Conversions + Purchase (Meta/Google).
 * Lê ux_user_data / current_order do localStorage e envia user_data no gtag.
 */
(function () {
  var AW_IDS = ['AW-18021235030', 'AW-18304143666', 'AW-18329036313'];
  var PURCHASE_KEY = 'ads_purchase_sent_v1';

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null') || null;
    } catch (e) {
      return null;
    }
  }

  function digits(v) {
    return String(v || '').replace(/\D+/g, '');
  }

  function toE164Br(phone) {
    var d = digits(phone);
    if (!d) return '';
    if (d.indexOf('55') === 0 && d.length >= 12) return '+' + d;
    if (d.length >= 10 && d.length <= 11) return '+55' + d;
    return d.charAt(0) === '+' ? String(phone).trim() : '+' + d;
  }

  function splitName(full) {
    var parts = String(full || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { first_name: '', last_name: '' };
    return {
      first_name: parts[0],
      last_name: parts.length > 1 ? parts.slice(1).join(' ') : '',
    };
  }

  function buildUserData() {
    var ux = readJson('ux_user_data') || {};
    var order = readJson('current_order') || {};
    var email = String(ux.email || ux.email_cliente || order.email || '').trim().toLowerCase();
    var phone = toE164Br(ux.whatsapp || ux.telefone || ux.phone || order.whatsapp || '');
    var names = splitName(ux.nome || ux.name || order.nome || '');
    var address = {
      first_name: names.first_name || undefined,
      last_name: names.last_name || undefined,
      street: [ux.rua || ux.street, ux.numero || ux.number].filter(Boolean).join(', ') || undefined,
      city: ux.cidade || ux.city || undefined,
      region: ux.estado || ux.region || undefined,
      postal_code: digits(ux.cep || ux.postal_code || '') || undefined,
      country: 'BR',
    };
    Object.keys(address).forEach(function (k) {
      if (!address[k]) delete address[k];
    });
    var out = {};
    if (email && email.indexOf('@') > 0) out.email = email;
    if (phone) out.phone_number = phone;
    if (Object.keys(address).length > 1) out.address = address;
    return Object.keys(out).length ? out : null;
  }

  function applyUserData() {
    if (typeof gtag !== 'function') return false;
    var ud = buildUserData();
    if (!ud) return false;
    try {
      gtag('set', 'user_data', ud);
      return true;
    } catch (e) {
      return false;
    }
  }

  function alreadySent(tx) {
    try {
      var raw = sessionStorage.getItem(PURCHASE_KEY) || '';
      return raw && tx && raw === String(tx);
    } catch (e) {
      return false;
    }
  }

  function markSent(tx) {
    try {
      sessionStorage.setItem(PURCHASE_KEY, String(tx || '1'));
    } catch (e) { /* ignore */ }
  }

  function trackPurchase(opts) {
    opts = opts || {};
    var order = readJson('current_order') || {};
    var tx = String(opts.transaction_id || order.order_id || '').trim();
    if (tx && alreadySent(tx)) return false;
    var value = Number(opts.value != null ? opts.value : order.total);
    if (!isFinite(value) || value < 0) value = 0;

    applyUserData();

    if (typeof gtag === 'function') {
      gtag('event', 'purchase', {
        transaction_id: tx || undefined,
        value: value,
        currency: 'BRL',
      });
      AW_IDS.forEach(function (id) {
        gtag('event', 'conversion', {
          send_to: id,
          value: value,
          currency: 'BRL',
          transaction_id: tx || undefined,
        });
      });
    }

    if (typeof fbq === 'function') {
      fbq('track', 'Purchase', { value: value, currency: 'BRL' });
    }

    if (tx) markSent(tx);
    return true;
  }

  function boot() {
    applyUserData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.AdsEnhanced = {
    applyUserData: applyUserData,
    trackPurchase: trackPurchase,
    buildUserData: buildUserData,
  };
})();
