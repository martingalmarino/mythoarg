/**
 * MYTHO Argentina — script.js
 * Premium Omnichannel Launch Landing Page
 * Version: 1.0.0  |  © 2026 MYTHO Eyewear
 *
 * TABLE OF CONTENTS
 * -----------------
 * 1.  Utility Helpers
 * 2.  Event Tracking (simulated analytics)
 * 3.  Sticky Header & Transparent-to-Solid Transition
 * 4.  Mobile Menu (hamburger open / close)
 * 5.  Smooth Scroll with Header Offset
 * 6.  Product Filter Tabs
 * 7.  City Selector — Store Locator
 * 8.  FAQ Accordion
 * 9.  B2B Form Validation
 * 10. Newsletter Form
 * 11. Tracked Button Click Events
 * 12. Scroll Reveal Animation
 * 13. Init — Run everything on DOMContentLoaded
 */

'use strict';

/* ============================================================
   1. UTILITY HELPERS
   ============================================================ */

/**
 * Lightweight debounce — limits how often a function fires.
 * Used for scroll and resize events.
 *
 * @param {Function} fn    - The function to throttle.
 * @param {number}   delay - Delay in milliseconds.
 * @returns {Function}
 */
function debounce(fn, delay) {
  var timer;
  return function () {
    var args = arguments;
    var ctx  = this;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, delay);
  };
}

/**
 * Safe querySelector wrapper — returns null without throwing.
 * @param {string}      selector
 * @param {Element}     [scope=document]
 * @returns {Element|null}
 */
function qs(selector, scope) {
  return (scope || document).querySelector(selector);
}

/**
 * Safe querySelectorAll wrapper — always returns an Array.
 * @param {string}      selector
 * @param {Element}     [scope=document]
 * @returns {Element[]}
 */
function qsa(selector, scope) {
  return Array.prototype.slice.call(
    (scope || document).querySelectorAll(selector)
  );
}


/* ============================================================
   2. EVENT TRACKING (SIMULATED ANALYTICS)
   ============================================================ */

/**
 * trackEvent — logs a named analytics event to the console.
 * Replace the console.log body with your real analytics
 * (gtag, dataLayer, Plausible, etc.) when going live.
 *
 * @param {string} eventName - e.g. "whatsapp_click"
 * @param {Object} [data={}] - Optional payload.
 */
function trackEvent(eventName, data) {
  data = data || {};
  console.log(
    '%c[MYTHO Analytics]',
    'color:#104BFF; font-weight:700; font-size:12px;',
    eventName,
    data
  );

  /* --- Uncomment to push to GTM dataLayer ---
  if (window.dataLayer) {
    window.dataLayer.push({
      event:     eventName,
      eventData: data
    });
  }
  */
}


/* ============================================================
   3. STICKY HEADER
   Starts transparent over the hero; becomes solid on scroll.
   ============================================================ */

function initStickyHeader() {
  var header = qs('#site-header');
  if (!header) return;

  /* Set initial transparent state */
  header.classList.add('is-transparent');

  var handleScroll = debounce(function () {
    if (window.scrollY > 48) {
      header.classList.remove('is-transparent');
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
      header.classList.add('is-transparent');
    }
  }, 12);

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); /* run once on page load */
}


/* ============================================================
   4. MOBILE MENU
   Hamburger toggles nav open/close with keyboard support.
   ============================================================ */

function initMobileMenu() {
  var hamburger = qs('#hamburger');
  var nav       = qs('#main-nav');
  if (!hamburger || !nav) return;

  var isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('is-active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Cerrar menú');
    nav.classList.add('is-open');
    document.body.style.overflow = 'hidden'; /* lock scroll behind overlay */
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Abrir menú');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* Toggle on hamburger click */
  hamburger.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  /* Close when a nav link is clicked */
  qsa('.nav-link', nav).forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape key */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      hamburger.focus();
    }
  });

  /* Close when clicking outside nav and hamburger */
  document.addEventListener('click', function (e) {
    if (isOpen && !nav.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });
}


/* ============================================================
   5. SMOOTH SCROLL WITH HEADER OFFSET
   Intercepts anchor clicks and scrolls to target accounting
   for the fixed header height.
   ============================================================ */

function initSmoothScroll() {
  /* Read the CSS custom property for header height */
  var headerH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--header-h')
  ) || 72;

  qsa('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var hash     = this.getAttribute('href');
      var targetId = hash.slice(1);
      if (!targetId) return;

      var target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();

      /* Extra padding above section for breathing room */
      var offset    = headerH + 16;
      var targetTop = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   6. PRODUCT FILTER TABS
   Filters product cards by data-categories attribute.
   ============================================================ */

function initProductFilters() {
  var tabs  = qsa('.filter-tab');
  var cards = qsa('.product-card');
  if (!tabs.length || !cards.length) return;

  /**
   * Apply filter — shows/hides cards based on category match.
   * @param {string} filter - e.g. "sol", "bio-acetato", or "all"
   */
  function applyFilter(filter) {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-categories') || '').split(' ');
      var show = filter === 'all' || cats.indexOf(filter) !== -1;

      if (show) {
        card.classList.remove('is-hidden');
        visibleCount++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    trackEvent('product_filter', { filter: filter, visible: visibleCount });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () {
      /* Update ARIA and active class */
      tabs.forEach(function (t, i) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      this.setAttribute('tabindex', '0');

      applyFilter(this.getAttribute('data-filter') || 'all');
    });

    /* Keyboard navigation within tab list (left/right arrows) */
    tab.addEventListener('keydown', function (e) {
      var current = tabs.indexOf(this);
      var next    = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        next = (current + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        next = (current - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        next = 0;
      } else if (e.key === 'End') {
        next = tabs.length - 1;
      }

      if (next !== -1) {
        e.preventDefault();
        tabs[next].focus();
        tabs[next].click();
      }
    });
  });
}


/* ============================================================
   7. CITY SELECTOR — STORE LOCATOR
   Shows the matching store panel when a city button is clicked.
   ============================================================ */

function initCitySelector() {
  var cityBtns = qsa('.city-btn');
  var panels   = qsa('.stores-grid');
  if (!cityBtns.length || !panels.length) return;

  function showCity(cityKey) {
    /* Update button states */
    cityBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-city') === cityKey;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    /* Show matching panel, hide others */
    panels.forEach(function (panel) {
      var show = panel.getAttribute('data-city-panel') === cityKey;
      panel.classList.toggle('is-active', show);

      /* Use hidden attribute for accessibility */
      if (show) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    });

    trackEvent('city_selected', { city: cityKey });
  }

  cityBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showCity(this.getAttribute('data-city'));
    });
  });

  /* Ensure the default active city panel is visible on load */
  var defaultActive = qs('.city-btn.is-active') || cityBtns[0];
  if (defaultActive) {
    showCity(defaultActive.getAttribute('data-city'));
  }
}


/* ============================================================
   8. FAQ ACCORDION
   Single-open accordion with aria-expanded and keyboard support.
   ============================================================ */

function initFaqAccordion() {
  var items = qsa('.faq-item');
  if (!items.length) return;

  /**
   * Open a single FAQ item.
   * @param {Element} questionBtn - The button element.
   * @param {Element} answerEl    - The dd element.
   */
  function openItem(questionBtn, answerEl) {
    questionBtn.setAttribute('aria-expanded', 'true');
    answerEl.removeAttribute('hidden');
  }

  /**
   * Close a single FAQ item.
   * @param {Element} questionBtn
   * @param {Element} answerEl
   */
  function closeItem(questionBtn, answerEl) {
    questionBtn.setAttribute('aria-expanded', 'false');
    answerEl.setAttribute('hidden', '');
  }

  /** Close all items */
  function closeAll() {
    items.forEach(function (item) {
      var q = qs('.faq-question', item);
      var a = q ? document.getElementById(q.getAttribute('aria-controls')) : null;
      if (q && a) closeItem(q, a);
    });
  }

  items.forEach(function (item) {
    var questionBtn = qs('.faq-question', item);
    if (!questionBtn) return;

    var answerId = questionBtn.getAttribute('aria-controls');
    var answerEl = answerId ? document.getElementById(answerId) : null;
    if (!answerEl) return;

    questionBtn.addEventListener('click', function () {
      var isExpanded = this.getAttribute('aria-expanded') === 'true';

      /* Close all first (accordion behaviour) */
      closeAll();

      /* If it was closed, open it now */
      if (!isExpanded) {
        openItem(this, answerEl);
        trackEvent('faq_open', { question: this.textContent.trim().slice(0, 60) });
      }
    });
  });
}


/* ============================================================
   9. B2B FORM VALIDATION
   Client-side validation with inline error messages.
   Does NOT submit data — simulates success on valid input.
   ============================================================ */

function initB2BForm() {
  var form       = qs('#b2b-form');
  var successMsg = qs('#form-success');
  if (!form) return;

  /* Fields to validate: { id, errorId, label } */
  var requiredFields = [
    { id: 'f-nombre', errorId: 'err-nombre', label: 'Nombre y apellido' },
    { id: 'f-optica', errorId: 'err-optica', label: 'Nombre de la óptica' },
    { id: 'f-ciudad', errorId: 'err-ciudad', label: 'Ciudad' },
    { id: 'f-email',  errorId: 'err-email',  label: 'Email' }
  ];

  /* Email regex (RFC-5322 simplified) */
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /**
   * Validate a single field and display its error message.
   * @param {HTMLElement} input
   * @param {HTMLElement} errorEl
   * @returns {boolean} - true if valid
   */
  function validateField(input, errorEl) {
    var value = input.value.trim();
    var msg   = '';

    if (input.required && !value) {
      msg = 'Este campo es obligatorio.';
    } else if (input.type === 'email' && value && !emailRe.test(value)) {
      msg = 'Ingresá un email válido.';
    }

    if (errorEl) errorEl.textContent = msg;

    if (msg) {
      input.classList.add('has-error');
      return false;
    }

    input.classList.remove('has-error');
    return true;
  }

  /* Attach blur-time validation to each required field */
  requiredFields.forEach(function (field) {
    var input   = qs('#' + field.id);
    var errorEl = qs('#' + field.errorId);
    if (!input) return;

    input.addEventListener('blur', function () {
      validateField(this, errorEl);
    });

    /* Clear error on input (live feedback) */
    input.addEventListener('input', function () {
      if (this.classList.contains('has-error')) {
        validateField(this, errorEl);
      }
    });
  });

  /* Form submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var isValid = true;

    /* Validate all required fields */
    requiredFields.forEach(function (field) {
      var input   = qs('#' + field.id);
      var errorEl = qs('#' + field.errorId);
      if (input && !validateField(input, errorEl)) {
        isValid = false;
      }
    });

    if (!isValid) {
      /* Focus the first invalid field */
      var firstError = qs('.has-error', form);
      if (firstError) firstError.focus();
      return;
    }

    /* --- Simulate successful submission --- */
    var optica  = (qs('#f-optica',  form) || {}).value || '';
    var ciudad  = (qs('#f-ciudad',  form) || {}).value || '';

    trackEvent('b2b_lead', { optica: optica, ciudad: ciudad });

    /* Hide form, show success banner */
    form.setAttribute('hidden', '');
    if (successMsg) {
      successMsg.removeAttribute('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}


/* ============================================================
   10. NEWSLETTER FORM
   Simple email validation + simulated success state.
   ============================================================ */

function initNewsletterForm() {
  var form     = qs('#newsletter-form');
  var feedback = qs('#newsletter-feedback');
  if (!form) return;

  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var emailInput = qs('#newsletter-email', form);
    if (!emailInput) return;

    var value = emailInput.value.trim();

    if (!value || !emailRe.test(value)) {
      if (feedback) {
        feedback.textContent = 'Por favor ingresá un email válido.';
        feedback.style.color = 'var(--red)';
      }
      if (emailInput) emailInput.focus();
      return;
    }

    /* Simulate success */
    trackEvent('newsletter_signup', { email: value });

    emailInput.value = '';
    if (feedback) {
      feedback.textContent = '¡Suscripción confirmada! Te avisaremos las novedades.';
      feedback.style.color = 'rgba(255,255,255,.7)';
    }
  });
}


/* ============================================================
   11. TRACKED BUTTON CLICK EVENTS
   Attaches a click listener to every element with data-event.
   Logs the event name and element label to the console.
   Replace console.log with real analytics in production.
   ============================================================ */

function initTrackedButtons() {
  qsa('[data-event]').forEach(function (el) {
    el.addEventListener('click', function () {
      var eventName = this.getAttribute('data-event');
      var label     = (this.textContent || '').trim() ||
                      this.getAttribute('aria-label') || '';

      trackEvent(eventName, { label: label.slice(0, 80) });
    });
  });
}


/* ============================================================
   12. SCROLL REVEAL ANIMATION
   Adds .reveal class to target elements.
   IntersectionObserver removes the fade-in-up state.
   Falls back gracefully when IO is not available.
   ============================================================ */

function initScrollReveal() {
  /* Selectors to animate on scroll */
  var selectors = [
    '.feature-card',
    '.product-card',
    '.tech-block',
    '.store-card',
    '.flow-step',
    '.b2b-card',
    '.faq-item',
    '.manifesto-quote'
  ].join(', ');

  var elements = qsa(selectors);

  /* If IntersectionObserver is unavailable, just show everything */
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  /* Add reveal class to each element */
  elements.forEach(function (el) {
    el.classList.add('reveal');
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); /* animate once */
        }
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -32px 0px'
    }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}


/* ============================================================
   13. NAV LINK FILTER BRIDGE
   Clicking "Sol" or "Receta" nav links pre-selects
   the matching product filter tab on arrival.
   ============================================================ */

function initNavFilterBridge() {
  qsa('[data-filter-target]').forEach(function (link) {
    link.addEventListener('click', function () {
      var target = this.getAttribute('data-filter-target');
      /* Small delay so smooth scroll completes before firing */
      setTimeout(function () {
        var matchingTab = qs('.filter-tab[data-filter="' + target + '"]');
        if (matchingTab) matchingTab.click();
      }, 600);
    });
  });
}


/* ============================================================
   INIT — Run all modules on DOMContentLoaded
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  initStickyHeader();    /* Header scroll behaviour         */
  initMobileMenu();      /* Hamburger open / close          */
  initSmoothScroll();    /* Anchor links with offset        */
  initProductFilters();  /* Collection filter tabs          */
  initCitySelector();    /* Store locator city switch       */
  initFaqAccordion();    /* FAQ expand / collapse           */
  initB2BForm();         /* B2B form validation             */
  initNewsletterForm();  /* Newsletter signup form          */
  initTrackedButtons();  /* data-event click logging        */
  initScrollReveal();    /* Fade-in on scroll               */
  initNavFilterBridge(); /* Nav link → filter tab sync      */

  /* Dev note logged on boot */
  console.log(
    '%cMYTHO Argentina v1.0 — Ready',
    'color:#104BFF; font-weight:700; font-size:13px;'
  );

});
