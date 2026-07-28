/**
 * Rodapé institucional Brasa Burguer (home + checkout + PIX)
 * Ajuste CNPJ em BRASA_LEGAL.cnpj quando tiver o dado oficial.
 */
(function () {
  'use strict';

  var BRASA_LEGAL = {
    company: 'BRASA BURGUER',
    legalName: 'BRASA BURGUER',
    cnpj: '',
    email: 'eleni.rodrigues.costa@brasaburguer.delivery',
    tagline: 'Hambúrgueres Artesanais'
  };

  function buildHtml() {
    var cnpjPart = BRASA_LEGAL.cnpj
      ? ' - CNPJ: ' + BRASA_LEGAL.cnpj
      : '';
    var year = new Date().getFullYear();
    return (
      '<footer class="brasa-site-footer" role="contentinfo">' +
      '  <div class="brasa-footer-inner">' +
      '    <div class="brasa-footer-legal">' +
      '      ' + BRASA_LEGAL.company + ' | Todos os direitos reservados<br>' +
      '      © ' + year + ' ' + BRASA_LEGAL.legalName + ' | ' + BRASA_LEGAL.tagline + cnpjPart + '<br>' +
      '      E-mail: <a href="mailto:' + BRASA_LEGAL.email + '">' + BRASA_LEGAL.email + '</a>' +
      '    </div>' +
      '    <div class="brasa-footer-pay-label">Formas de pagamento:</div>' +
      '    <div class="brasa-footer-pay-row">' +
      '      <div class="brasa-footer-pix" title="PIX">' +
      '        <img src="/images/pix.svg?v=2" alt="PIX" width="32" height="32" decoding="async">' +
      '      </div>' +
      '      <div class="brasa-footer-secure">' +
      '        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
      '          <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>' +
      '        </svg>' +
      '        <span>PAGAMENTO<br>100% SEGURO</span>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</footer>'
    );
  }

  function ensureCss() {
    if (document.querySelector('link[href*="brasa-footer.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/brasa-footer.css?v=2';
    document.head.appendChild(link);
  }

  function mount() {
    if (document.querySelector('.brasa-site-footer')) return;
    ensureCss();
    var html = buildHtml();
    var wrap = document.querySelector('.wrap') || document.querySelector('.container') || document.body;
    var target = document.getElementById('brasaFooterSlot') || wrap;
    if (target === document.body) {
      document.body.insertAdjacentHTML('beforeend', html);
    } else if (target.id === 'brasaFooterSlot') {
      target.outerHTML = html;
    } else {
      target.insertAdjacentHTML('beforeend', html);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }

  window.BRASA_LEGAL = BRASA_LEGAL;
})();
