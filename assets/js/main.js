/* ==========================================================================
   Hua Hin Dream Homes — Interaktion
   ========================================================================== */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '41762423742';

  const root = document.documentElement;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* privat / blockiert */ } }
  };

  /* ------------------------------------------------------------------------
     Sprache (DE / EN)
     ------------------------------------------------------------------------ */
  // Attribute, die per data-en-* übersetzt werden (z. B. data-en-placeholder)
  const I18N_ATTRS = ['placeholder', 'aria-label', 'content'];

  function applyLang(lang) {
    root.lang = lang;

    $$('[data-set-lang]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang));
    });

    // Textinhalte, die nicht doppelt im HTML stehen können (z. B. <title>, <option>)
    $$('[data-en]').forEach(el => {
      if (el.dataset.de === undefined) el.dataset.de = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.de;
    });

    I18N_ATTRS.forEach(attr => {
      $$(`[data-en-${attr}]`).forEach(el => {
        const key = `data-de-${attr}`;
        if (!el.hasAttribute(key)) el.setAttribute(key, el.getAttribute(attr) || '');
        el.setAttribute(attr, el.getAttribute(lang === 'en' ? `data-en-${attr}` : key));
      });
    });
  }

  function initialLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl === 'de' || fromUrl === 'en') return fromUrl;
    const saved = store.get('hhdh-lang');
    if (saved === 'de' || saved === 'en') return saved;
    return (navigator.language || 'de').toLowerCase().startsWith('de') ? 'de' : 'en';
  }

  applyLang(initialLang());

  $$('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.setLang);
      store.set('hhdh-lang', btn.dataset.setLang);
    });
  });

  /* ------------------------------------------------------------------------
     Header: Zustand beim Scrollen, Ausblenden beim Runterscrollen
     ------------------------------------------------------------------------ */
  const header = $('[data-header]');
  const fab = $('[data-fab]');
  let lastY = window.scrollY;
  let menuOpen = false;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    header.classList.toggle('is-hidden', !menuOpen && y > 480 && y > lastY + 2);
    if (y < lastY - 2 || y < 480) header.classList.remove('is-hidden');
    fab?.classList.toggle('is-visible', y > window.innerHeight * 0.85);
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
     Mobiles Menü
     ------------------------------------------------------------------------ */
  const burger = $('[data-burger]');
  const menu = $('#mobile-menu');

  function setMenu(open) {
    menuOpen = open;
    burger.setAttribute('aria-expanded', String(open));
    const de = open ? 'Menü schließen' : 'Menü öffnen';
    const en = open ? 'Close menu' : 'Open menu';
    burger.setAttribute('data-de-aria-label', de);
    burger.setAttribute('data-en-aria-label', en);
    burger.setAttribute('aria-label', root.lang === 'en' ? en : de);
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    root.classList.toggle('menu-open', open);
    if (open) header.classList.remove('is-hidden');
  }

  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(!menuOpen));
    $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1181px)').addEventListener('change', e => {
      if (e.matches && menuOpen) setMenu(false);
    });
  }

  /* ------------------------------------------------------------------------
     Scroll-Reveal
     ------------------------------------------------------------------------ */
  $$('[data-stagger]').forEach(group => {
    $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--d', `${i * 0.09}s`));
  });

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ------------------------------------------------------------------------
     Aktiver Navigationspunkt
     ------------------------------------------------------------------------ */
  const navLinks = $$('.nav a[href^="#"]');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ------------------------------------------------------------------------
     Kontaktformular
     ------------------------------------------------------------------------ */
  const form = $('#contact-form');
  const status = $('[data-form-status]');
  const t = (de, en) => (root.lang === 'en' ? en : de);
  const field = name => form.elements.namedItem(name);

  // "Exposé anfragen" & Suchauftrag: Formular vorbelegen
  $$('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      if (!form) return;
      field('interest').value = link.dataset.interest;
      const subject = root.lang === 'en' ? link.dataset.enquireEn : link.dataset.enquireDe;
      const message = field('message');
      if (subject && !message.value.trim()) {
        message.value = t(
          `Ich interessiere mich für: ${subject}. Bitte senden Sie mir weitere Informationen.`,
          `I am interested in: ${subject}. Please send me more information.`
        );
      }
    });
  });

  function showStatus(type, message) {
    status.className = `form-status is-visible${type === 'error' ? ' is-error' : ''}`;
    status.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${type === 'error' ? 'alert' : 'check'}"/></svg><span></span>`;
    status.querySelector('span').textContent = message;
  }

  function selectedText(select) {
    return select.value ? select.options[select.selectedIndex].text.trim() : '';
  }

  form?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.checkValidity()) {
      const firstInvalid = $$('input, select, textarea', form).find(el => !el.checkValidity());
      showStatus('error', t(
        'Bitte füllen Sie alle Pflichtfelder aus und bestätigen Sie die Datenschutzhinweise.',
        'Please fill in all required fields and accept the privacy notice.'
      ));
      firstInvalid?.focus();
      return;
    }

    const button = $('button[type="submit"]', form);
    const endpoint = (form.dataset.endpoint || '').trim();
    button.disabled = true;

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        showStatus('success', t(
          'Vielen Dank! Ihre Anfrage ist bei uns eingegangen. Wir melden uns in der Regel innerhalb von 24 Stunden.',
          'Thank you! We have received your enquiry and will usually get back to you within 24 hours.'
        ));
      } else {
        // Ohne Server: Anfrage als vorformulierte WhatsApp-Nachricht öffnen
        const phone = field('phone').value.trim();
        const lines = [
          t('Neue Anfrage über die Website', 'New enquiry via the website'),
          '',
          `Name: ${field('name').value.trim()}`,
          `${t('E-Mail', 'Email')}: ${field('email').value.trim()}`,
          phone ? `${t('Telefon', 'Phone')}: ${phone}` : null,
          `${t('Interesse', 'Interest')}: ${selectedText(field('interest'))}`,
          field('budget').value ? `Budget: ${selectedText(field('budget'))}` : null,
          '',
          field('message').value.trim()
        ].filter(line => line !== null);
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
        window.open(url, '_blank', 'noopener');
        showStatus('success', t(
          'WhatsApp wurde mit Ihrer Anfrage geöffnet – bitte dort nur noch auf „Senden“ tippen.',
          'WhatsApp has opened with your enquiry – just tap “Send” there.'
        ));
      }
    } catch {
      showStatus('error', t(
        'Leider ist etwas schiefgelaufen. Bitte schreiben Sie uns direkt per WhatsApp: +41 76 242 37 42.',
        'Something went wrong. Please message us directly on WhatsApp: +41 76 242 37 42.'
      ));
    } finally {
      button.disabled = false;
    }
  });

  /* ------------------------------------------------------------------------
     Kleinigkeiten
     ------------------------------------------------------------------------ */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
