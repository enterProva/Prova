const initNav = () => {
  const menuButton = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navBackdrop = document.querySelector('.nav-backdrop');

  if (!menuButton || !navLinks) {
    return;
  }

  const closeMenu = () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    navBackdrop?.classList.remove('open');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open', !expanded);
    navBackdrop?.classList.toggle('open', !expanded);
    document.body.classList.toggle('menu-open', !expanded);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menuButton.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      }
    });
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!navLinks.contains(target) && !menuButton.contains(target)) {
      closeMenu();
    }
  });

  navBackdrop?.addEventListener('click', closeMenu);
};

const initReveal = () => {
  const revealSelector = 'section, .footer, .navbar-inner, .waitlist-page, .waitlist-shell, .clip-card, .preview-item, .mil-card, .mil-affiliation, .flow-card, .flow-footer-card, .footer-contact-card';
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -12% 0px' });

  document.body.classList.add('reveal-enabled');
  document.querySelectorAll(revealSelector).forEach((el, index) => {
    el.classList.add('reveal-on-scroll');
    el.style.setProperty('--reveal-delay', `${Math.min(index * 0.045, 0.45)}s`);
    revealObserver.observe(el);
  });
};

const initHeroModal = () => {
  const trigger = document.querySelector('.video-trigger');
  const modal = document.querySelector('.video-modal');
  const closeBtn = document.querySelector('.video-close');
  const cancelBtn = document.querySelector('.confirm-cancel');
  const backdrop = document.querySelector('.video-backdrop');

  if (!modal || !trigger) {
    return;
  }

  const setModalOpen = (open) => {
    modal.classList.toggle('is-open', open);
    modal.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  trigger.addEventListener('click', () => setModalOpen(true));
  closeBtn?.addEventListener('click', () => setModalOpen(false));
  cancelBtn?.addEventListener('click', () => setModalOpen(false));
  backdrop?.addEventListener('click', () => setModalOpen(false));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      setModalOpen(false);
    }
  });
};

const initWaitlistForms = () => {
  const forms = document.querySelectorAll('[data-waitlist-form]');

  forms.forEach((formElement) => {
    if (!(formElement instanceof HTMLFormElement) || formElement.dataset.bound === 'true') return;

    formElement.dataset.bound = 'true';
    const submitButton = formElement.querySelector('button[type="submit"]');
    const message = formElement.querySelector('[data-form-message]');
    const defaultButtonText = submitButton?.textContent ?? 'Submit';

    const setMessage = (text, tone = 'neutral') => {
      if (!(message instanceof HTMLElement)) return;
      message.textContent = text;
      message.dataset.tone = tone;
    };

    formElement.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!formElement.reportValidity()) return;

      const formData = new FormData(formElement);

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';
      }

      setMessage('Submitting your request...', 'neutral');

      try {
        const response = await fetch(formElement.action, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json',
          },
        });

        const payload = await response.json().catch(() => ({}));
        const text = typeof payload.message === 'string' ? payload.message : 'We could not submit your request. Please try again.';

        if (!response.ok) {
          setMessage(text, 'error');
          return;
        }

        formElement.reset();
        setMessage(text, 'success');
      } catch (error) {
        console.error('Waitlist submission failed', error);
        setMessage('The connection failed. Please try again in a moment.', 'error');
      } finally {
        if (submitButton instanceof HTMLButtonElement) {
          submitButton.disabled = false;
          submitButton.textContent = defaultButtonText;
        }
      }
    });
  });
};

const init = () => {
  initNav();
  initReveal();
  initHeroModal();
  initWaitlistForms();
};

document.addEventListener('DOMContentLoaded', init);
