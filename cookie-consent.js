(function () {
  const STORAGE_KEY = 'mp_cookie_consent_v1';
  const CATEGORIES = ['functional', 'analytics', 'marketing'];

  const defaultConsent = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
    savedAt: null
  };

  const readConsent = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.necessary ? { ...defaultConsent, ...saved } : null;
    } catch (error) {
      return null;
    }
  };

  const writeConsent = (choices) => {
    const consent = {
      ...defaultConsent,
      ...choices,
      necessary: true,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    applyConsent(consent);
    hideBanner();
    showTrigger();
  };

  const applyConsent = (consent) => {
    CATEGORIES.forEach((category) => {
      document.querySelectorAll(`[data-cookie-category="${category}"][data-cookie-src]`).forEach((element) => {
        if (consent[category] && !element.getAttribute('src')) {
          element.setAttribute('src', element.getAttribute('data-cookie-src'));
        }
        if (!consent[category] && element.getAttribute('src')) {
          element.removeAttribute('src');
        }
      });

      document.querySelectorAll(`[data-cookie-placeholder="${category}"]`).forEach((element) => {
        element.hidden = !!consent[category];
      });
    });
  };

  const buildBanner = () => {
    if (document.querySelector('[data-cookie-banner]')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <section class="cookie-banner" data-cookie-banner role="dialog" aria-live="polite" aria-label="Preferenze cookie">
        <div>
          <h2>Preferenze cookie</h2>
          <p>Usiamo cookie tecnici necessari al funzionamento del sito. Con il tuo consenso possiamo caricare contenuti funzionali di terze parti, come Google Maps. Puoi accettare, rifiutare o scegliere le singole preferenze.</p>
          <p><a href="cookie-policy.html">Cookie Policy</a> · <a href="privacy-policy.html">Privacy Policy</a></p>
        </div>
        <div class="cookie-actions">
          <button class="cookie-btn" type="button" data-cookie-reject>Rifiuta</button>
          <button class="cookie-btn" type="button" data-cookie-customize>Personalizza</button>
          <button class="cookie-btn primary" type="button" data-cookie-accept-all>Accetta tutto</button>
        </div>
      </section>
      <button class="cookie-preferences-trigger" type="button" data-cookie-open-preferences aria-label="Modifica preferenze cookie">Cookie</button>
      <section class="cookie-modal" data-cookie-modal aria-hidden="true" aria-label="Centro preferenze cookie">
        <div class="cookie-modal-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
          <div class="cookie-modal-head">
            <div>
              <h2 id="cookie-modal-title">Centro preferenze</h2>
              <p>Puoi modificare o revocare il consenso in qualsiasi momento. I cookie non necessari restano disattivati finché non li abiliti.</p>
            </div>
            <button class="cookie-close" type="button" data-cookie-close aria-label="Chiudi preferenze">×</button>
          </div>

          <div class="cookie-choice">
            <div>
              <h3>Cookie tecnici necessari</h3>
              <p>Servono per ricordare le preferenze cookie e far funzionare correttamente il sito. Sono sempre attivi.</p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" checked disabled>
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-choice">
            <div>
              <h3>Funzionali e contenuti esterni</h3>
              <p>Consentono di caricare servizi esterni, come la mappa di Google Maps nella sezione “Dove siamo”.</p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" data-cookie-choice="functional">
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-choice">
            <div>
              <h3>Analytics</h3>
              <p>Al momento non usiamo strumenti di analytics. Questa preferenza è predisposta per eventuali statistiche anonime future.</p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" data-cookie-choice="analytics">
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-choice">
            <div>
              <h3>Marketing</h3>
              <p>Al momento non usiamo cookie di marketing o profilazione. Questa preferenza resta disattivata salvo scelta esplicita.</p>
            </div>
            <label class="cookie-switch">
              <input type="checkbox" data-cookie-choice="marketing">
              <span class="cookie-slider"></span>
            </label>
          </div>

          <div class="cookie-modal-actions">
            <button class="cookie-btn" type="button" data-cookie-reject>Rifiuta tutto</button>
            <button class="cookie-btn" type="button" data-cookie-save>Salva preferenze</button>
            <button class="cookie-btn primary" type="button" data-cookie-accept-all>Accetta tutto</button>
          </div>
        </div>
      </section>
    `);
  };

  const banner = () => document.querySelector('[data-cookie-banner]');
  const modal = () => document.querySelector('[data-cookie-modal]');
  const trigger = () => document.querySelector('.cookie-preferences-trigger');

  const showBanner = () => banner()?.classList.add('is-visible');
  const hideBanner = () => banner()?.classList.remove('is-visible');
  const showTrigger = () => trigger()?.classList.add('is-visible');

  const openModal = () => {
    const consent = readConsent() || defaultConsent;
    document.querySelectorAll('[data-cookie-choice]').forEach((input) => {
      input.checked = !!consent[input.getAttribute('data-cookie-choice')];
    });
    modal()?.classList.add('is-visible');
    modal()?.setAttribute('aria-hidden', 'false');
  };

  const closeModal = () => {
    modal()?.classList.remove('is-visible');
    modal()?.setAttribute('aria-hidden', 'true');
  };

  const saveChoicesFromModal = () => {
    const choices = {};
    document.querySelectorAll('[data-cookie-choice]').forEach((input) => {
      choices[input.getAttribute('data-cookie-choice')] = input.checked;
    });
    writeConsent(choices);
    closeModal();
  };

  const acceptAll = () => {
    writeConsent({ functional: true, analytics: true, marketing: true });
    closeModal();
  };

  const rejectAll = () => {
    writeConsent({ functional: false, analytics: false, marketing: false });
    closeModal();
  };

  const bindEvents = () => {
    document.addEventListener('click', (event) => {
      const target = event.target.closest('button, a');
      if (!target) return;

      if (target.matches('[data-cookie-accept-all]')) acceptAll();
      if (target.matches('[data-cookie-reject]')) rejectAll();
      if (target.matches('[data-cookie-customize], [data-cookie-open-preferences]')) openModal();
      if (target.matches('[data-cookie-close]')) closeModal();
      if (target.matches('[data-cookie-save]')) saveChoicesFromModal();
      if (target.matches('[data-cookie-accept="functional"]')) {
        const current = readConsent() || defaultConsent;
        writeConsent({ ...current, functional: true });
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });
  };

  const init = () => {
    buildBanner();
    bindEvents();
    const consent = readConsent();
    if (consent) {
      applyConsent(consent);
      showTrigger();
    } else {
      applyConsent(defaultConsent);
      showBanner();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

