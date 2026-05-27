/**
 * College ERP — Shared Theme JavaScript
 * Version: 1.0.0
 *
 * Usage:
 *   <script src="erp-theme.js"></script>
 *
 * All behaviour is driven by data-erp-* attributes.
 * No per-module JS configuration required.
 *
 * Global namespace: ERP
 *   ERP.Toast, ERP.Modal, ERP.Confirm, ERP.Sidebar,
 *   ERP.Notifications, ERP.Form, ERP.Loader, ERP.Breadcrumb
 */

(function (global) {
  'use strict';

  const ERP = {};

  /* ─────────────────────────────────────────────────────────
     SIDEBAR — collapse / expand / mobile drawer
  ───────────────────────────────────────────────────────── */
  ERP.Sidebar = {
    STORAGE_KEY: 'erp_sidebar_collapsed',

    init() {
      const sidebar = document.querySelector('.erp-sidebar');
      if (!sidebar) return;

      if (localStorage.getItem(this.STORAGE_KEY) === 'true') {
        sidebar.classList.add('erp-sidebar--collapsed');
        this._updateLayout(true);
      }

      document.querySelectorAll('[data-erp-sidebar-toggle]').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });

      this._createBackdrop();
    },

    toggle() {
      const sidebar = document.querySelector('.erp-sidebar');
      if (!sidebar) return;

      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('erp-sidebar--mobile-open');
        document.getElementById('erp-backdrop')?.classList.toggle('erp-backdrop--visible');
      } else {
        const collapsed = sidebar.classList.toggle('erp-sidebar--collapsed');
        localStorage.setItem(this.STORAGE_KEY, collapsed);
        this._updateLayout(collapsed);
      }
    },

    _updateLayout(collapsed) {
      /* DISABLED: Handled by React to prevent twin-margin gaps */
    },

    _createBackdrop() {
      const backdrop = document.createElement('div');
      backdrop.id = 'erp-backdrop';
      backdrop.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(0,0,0,.45)',
        'z-index:99', 'opacity:0', 'pointer-events:none',
        'transition:opacity .22s ease'
      ].join(';');
      backdrop.addEventListener('click', () => this.toggle());
      document.body.appendChild(backdrop);

      const style = document.createElement('style');
      style.textContent = '#erp-backdrop.erp-backdrop--visible { opacity:1!important; pointer-events:all!important; }';
      document.head.appendChild(style);
    }
  };

  /* ─────────────────────────────────────────────────────────
     ACTIVE NAV — highlight current page item
  ───────────────────────────────────────────────────────── */
  ERP.ActiveNav = {
    init() {
      const current = location.pathname;
      document.querySelectorAll('.erp-nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && href !== '#' && current.includes(href)) {
          item.classList.add('erp-nav-item--active');
        }
      });
    }
  };

  /* ─────────────────────────────────────────────────────────
     MODAL
     data-erp-modal-open="id"  → opens overlay #id
     data-erp-modal-close      → closes nearest overlay
  ───────────────────────────────────────────────────────── */
  ERP.Modal = {
    init() {
      document.querySelectorAll('[data-erp-modal-open]').forEach(trigger => {
        trigger.addEventListener('click', () => this.open(trigger.dataset.erpModalOpen));
      });

      document.querySelectorAll('[data-erp-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          const overlay = btn.closest('.erp-modal-overlay');
          if (overlay) this._closeEl(overlay);
        });
      });

      document.querySelectorAll('.erp-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
          if (e.target === overlay) this._closeEl(overlay);
        });
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.erp-modal-overlay.erp-modal--open')
            .forEach(o => this._closeEl(o));
        }
      });
    },

    open(id) {
      const el = document.getElementById(id);
      if (el) { el.classList.add('erp-modal--open'); document.body.style.overflow = 'hidden'; }
    },

    close(id) {
      const el = document.getElementById(id);
      if (el) this._closeEl(el);
    },

    _closeEl(overlay) {
      overlay.classList.remove('erp-modal--open');
      document.body.style.overflow = '';
    }
  };

  /* ─────────────────────────────────────────────────────────
     NOTIFICATION PANEL
     data-erp-notif-toggle  → toggles nearest .erp-notif-panel
  ───────────────────────────────────────────────────────── */
  ERP.Notifications = {
    init() {
      document.querySelectorAll('[data-erp-notif-toggle]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const panel = btn.nextElementSibling?.classList.contains('erp-notif-panel')
            ? btn.nextElementSibling
            : document.querySelector('.erp-notif-panel');
          if (panel) panel.classList.toggle('erp-notif--open');
        });
      });

      document.querySelectorAll('.erp-notif-panel__mark-read').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('.erp-notif-item--unread')
            .forEach(item => item.classList.remove('erp-notif-item--unread'));
          this.setBadge(0);
        });
      });

      document.addEventListener('click', () => {
        document.querySelectorAll('.erp-notif-panel.erp-notif--open')
          .forEach(p => p.classList.remove('erp-notif--open'));
      });
    },

    setBadge(count) {
      const dot = document.querySelector('[data-erp-notif-toggle] .erp-dot');
      if (!dot) return;
      dot.style.display = count === 0 ? 'none' : '';
      if (count > 0) dot.title = `${count} unread`;
    }
  };

  /* ─────────────────────────────────────────────────────────
     TOAST
     ERP.Toast.show('Message', 'success' | 'danger' | 'warning' | 'info', ms)
  ───────────────────────────────────────────────────────── */
  ERP.Toast = {
    _container: null,
    _icons: {
      success: 'fa-circle-check',
      danger:  'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info:    'fa-circle-info'
    },
    _colors: {
      success: { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
      danger:  { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3' },
      warning: { bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
      info:    { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' }
    },

    _ensure() {
      if (this._container) return;
      this._container = document.createElement('div');
      this._container.style.cssText = [
        'position:fixed', 'bottom:24px', 'right:24px',
        'display:flex', 'flex-direction:column', 'gap:10px',
        'z-index:9999', 'pointer-events:none'
      ].join(';');
      document.body.appendChild(this._container);
    },

    show(message, type = 'info', duration = 3500) {
      this._ensure();
      const c    = this._colors[type] || this._colors.info;
      const icon = this._icons[type]  || this._icons.info;

      const toast = document.createElement('div');
      toast.style.cssText = [
        'display:flex', 'align-items:center', 'gap:10px',
        'padding:13px 18px', 'border-radius:8px',
        `background:${c.bg}`, `color:${c.color}`, `border:1px solid ${c.border}`,
        'box-shadow:0 4px 16px rgba(0,0,0,.12)',
        'font-family:var(--erp-font,Poppins,sans-serif)', 'font-size:13px', 'font-weight:500',
        'pointer-events:all', 'max-width:320px', 'min-width:220px',
        'transform:translateX(120%)', 'transition:transform .3s ease'
      ].join(';');

      toast.innerHTML = `<i class="fa-solid ${icon}" style="font-size:16px;flex-shrink:0"></i><span>${message}</span>`;
      this._container.appendChild(toast);

      requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
      }));

      setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      }, duration);
    }
  };

  /* ─────────────────────────────────────────────────────────
     CONFIRM DIALOG
     ERP.Confirm.show({ title, message, onConfirm, onCancel, danger })
  ───────────────────────────────────────────────────────── */
  ERP.Confirm = {
    show({ title = 'Confirm', message = 'Are you sure?', onConfirm, onCancel, danger = false } = {}) {
      document.getElementById('erp-confirm-dialog')?.remove();

      const overlay = document.createElement('div');
      overlay.id = 'erp-confirm-dialog';
      overlay.className = 'erp-modal-overlay erp-modal--open';

      const okClass = danger ? 'erp-btn erp-btn--danger' : 'erp-btn erp-btn--primary';

      overlay.innerHTML = `
        <div class="erp-modal" style="max-width:400px">
          <div class="erp-modal__header">
            <span class="erp-modal__title">${title}</span>
            <button class="erp-modal__close" data-erp-confirm-cancel><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="erp-modal__body">
            <p style="font-size:13.5px;color:#444;line-height:1.6">${message}</p>
          </div>
          <div class="erp-modal__footer">
            <button class="erp-btn erp-btn--ghost" data-erp-confirm-cancel>Cancel</button>
            <button class="${okClass}" data-erp-confirm-ok>Confirm</button>
          </div>
        </div>`;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const cleanup = () => { overlay.remove(); document.body.style.overflow = ''; };

      overlay.querySelectorAll('[data-erp-confirm-cancel]')
        .forEach(el => el.addEventListener('click', () => { cleanup(); onCancel?.(); }));

      overlay.querySelector('[data-erp-confirm-ok]')
        .addEventListener('click', () => { cleanup(); onConfirm?.(); });

      overlay.addEventListener('click', e => {
        if (e.target === overlay) { cleanup(); onCancel?.(); }
      });
    }
  };

  /* ─────────────────────────────────────────────────────────
     BREADCRUMB
     Add data-erp-breadcrumb to nav, data-erp-page="Section / Page" to <main>
  ───────────────────────────────────────────────────────── */
  ERP.Breadcrumb = {
    init() {
      const nav  = document.querySelector('[data-erp-breadcrumb]');
      const main = document.querySelector('[data-erp-page]');
      if (!nav || !main) return;

      const parts = ['ERP', ...main.dataset.erpPage.split('/').map(s => s.trim())];
      nav.innerHTML = parts.map((part, i) =>
        i === parts.length - 1
          ? `<span class="current">${part}</span>`
          : `<span>${part}</span><i class="fa-solid fa-chevron-right"></i>`
      ).join('');
    }
  };

  /* ─────────────────────────────────────────────────────────
     TABLE SORT (client-side)
     Add data-erp-sortable to <table> to enable column sorting
  ───────────────────────────────────────────────────────── */
  ERP.TableSort = {
    init() {
      document.querySelectorAll('table[data-erp-sortable]').forEach(table => {
        table.querySelectorAll('th').forEach((th, colIdx) => {
          th.style.cursor    = 'pointer';
          th.style.userSelect = 'none';
          th._erpSortDir     = 1;

          th.addEventListener('click', () => {
            const tbody = table.querySelector('tbody');
            const rows  = Array.from(tbody.querySelectorAll('tr'));

            rows.sort((a, b) =>
              (a.cells[colIdx]?.textContent.trim() ?? '')
                .localeCompare(b.cells[colIdx]?.textContent.trim() ?? '', 'en', { numeric: true })
              * th._erpSortDir
            );

            th._erpSortDir *= -1;
            rows.forEach(r => tbody.appendChild(r));

            table.querySelectorAll('th').forEach(t => {
              t.textContent = t.textContent.replace(/ [↑↓]$/, '');
            });
            th.textContent += th._erpSortDir === 1 ? ' ↓' : ' ↑';
          });
        });
      });
    }
  };

  /* ─────────────────────────────────────────────────────────
     FORM VALIDATION
     ERP.Form.validate(formEl)  → returns true/false
     ERP.Form.clearErrors(formEl)
  ───────────────────────────────────────────────────────── */
  ERP.Form = {
    validate(formEl) {
      let valid = true;
      formEl.querySelectorAll('[required]').forEach(input => {
        const group = input.closest('.erp-form-group');
        this._clear(input, group);

        if (!input.value.trim()) {
          this._error(input, group, 'This field is required.');
          valid = false;
        } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
          this._error(input, group, 'Enter a valid email address.');
          valid = false;
        }
      });
      return valid;
    },

    clearErrors(formEl) {
      formEl.querySelectorAll('.erp-form-control--error').forEach(el => el.classList.remove('erp-form-control--error'));
      formEl.querySelectorAll('.erp-validation-msg').forEach(e => e.remove());
    },

    _error(input, group, msg) {
      input.classList.add('erp-form-control--error');
      if (group) {
        const el = document.createElement('span');
        el.className   = 'erp-form-error erp-validation-msg';
        el.textContent = msg;
        group.appendChild(el);
      }
    },

    _clear(input, group) {
      input.classList.remove('erp-form-control--error');
      group?.querySelectorAll('.erp-validation-msg').forEach(e => e.remove());
    }
  };

  /* ─────────────────────────────────────────────────────────
     PAGE LOADER
     ERP.Loader.show() / ERP.Loader.hide()
  ───────────────────────────────────────────────────────── */
  ERP.Loader = {
    _el: null,

    show() {
      if (this._el) { this._el.style.display = 'flex'; return; }

      this._el = document.createElement('div');
      this._el.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(255,255,255,.8)',
        'display:flex', 'align-items:center', 'justify-content:center', 'z-index:10000'
      ].join(';');

      this._el.innerHTML = `
        <div style="text-align:center">
          <div style="width:40px;height:40px;border-radius:50%;border:3px solid #d9dee6;border-top-color:var(--erp-primary,#1a56db);animation:erp-spin .7s linear infinite;margin:0 auto 12px"></div>
          <p style="font-family:var(--erp-font,Poppins,sans-serif);font-size:13px;color:#707070">Loading…</p>
        </div>`;

      document.body.appendChild(this._el);
    },

    hide() { if (this._el) this._el.style.display = 'none'; }
  };

  /* ─────────────────────────────────────────────────────────
     AUTO-INIT
  ───────────────────────────────────────────────────────── */
  function init() {
    ERP.Sidebar.init();
    ERP.ActiveNav.init();
    ERP.Modal.init();
    ERP.Notifications.init();
    ERP.Breadcrumb.init();
    ERP.TableSort.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.ERP = ERP;

}(window));
