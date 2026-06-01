/**
 * ZTS Unlock — verrou "freemium" sur les hubs métier (et le blog).
 * Règle : 1re app de #gridActive gratuite, le reste 🔒 tant que non-connecté.
 *         Pour le blog : [data-zts-lock="content"] masqué aux non-connectés.
 * Le clic sur un élément verrouillé ouvre un popup d'inscription (Google/courriel).
 * La connexion (Firebase, projet zone-total-sport) débloque tout.
 *
 * SEO : liens et texte restent dans le DOM (masqués en CSS), Google voit tout.
 * Brancher : <script src="shared/zts-unlock.js"></script> après shared/zts.js.
 */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyBoBxVP6g_ObKIJJ1jkviNFQ-wpJoWdjbA",
    authDomain: "zone-total-sport.firebaseapp.com",
    databaseURL: "https://zone-total-sport-default-rtdb.firebaseio.com",
    projectId: "zone-total-sport",
    storageBucket: "zone-total-sport.firebasestorage.app",
    messagingSenderId: "681359040455",
    appId: "1:681359040455:web:80c9f584583824cc8cc3e2",
    measurementId: "G-09S9R1HJ94"
  };

  var SELF = document.currentScript;
  var SHARED = SELF ? SELF.src.replace(/zts-unlock\.js.*$/, '') : 'shared/';
  var ROOT = SHARED.replace(/shared\/$/, '');

  var FREE_PER_GRID = 1;     // nb d'apps gratuites par grille #gridActive
  var authed = false;
  var mode = 'signup';       // 'signup' | 'login'

  var T = {
    fr: {
      lock: 'Inscris-toi pour débloquer',
      badge: '🔓 Accès gratuit', title: 'Crée ton compte gratuit',
      sub: 'Inscris-toi pour débloquer cet outil et les 20+ autres. 100 % gratuit, pour toujours.',
      google: 'Continuer avec Google', or: 'ou',
      email: 'Ton courriel', pass: 'Mot de passe (6+ caractères)',
      signup: 'Créer mon compte', login: 'Se connecter',
      toLogin: 'Déjà membre? Se connecter', toSignup: 'Nouveau? Créer un compte gratuit',
      close: 'Fermer', loading: 'Vérification…',
      ctaTitle: 'La suite est réservée aux membres',
      ctaSub: 'Crée ton compte gratuit pour lire l’article au complet.',
      ctaBtn: '🔓 Lire la suite gratuitement',
      errMail: 'Courriel ou mot de passe invalide.', errUsed: 'Ce courriel a déjà un compte — connecte-toi.',
      errPass: 'Mot de passe trop court (min. 6 caractères).', errGoogle: 'Connexion Google annulée ou bloquée.',
      errNet: 'Connexion impossible. Réessaie.'
    },
    en: {
      lock: 'Sign up to unlock',
      badge: '🔓 Free access', title: 'Create your free account',
      sub: 'Sign up to unlock this tool and 20+ others. 100% free, forever.',
      google: 'Continue with Google', or: 'or',
      email: 'Your email', pass: 'Password (6+ characters)',
      signup: 'Create my account', login: 'Sign in',
      toLogin: 'Already a member? Sign in', toSignup: 'New? Create a free account',
      close: 'Close', loading: 'Checking…',
      ctaTitle: 'The rest is for members',
      ctaSub: 'Create your free account to read the full article.',
      ctaBtn: '🔓 Read the rest for free',
      errMail: 'Invalid email or password.', errUsed: 'This email already has an account — sign in.',
      errPass: 'Password too short (min. 6 characters).', errGoogle: 'Google sign-in cancelled or blocked.',
      errNet: 'Connection failed. Try again.'
    }
  };
  function lang() { return (window.ZTS && ZTS.getLang && ZTS.getLang() === 'en') ? 'en' : 'fr'; }
  function t() { return T[lang()]; }

  /* ---------- STYLES ---------- */
  function injectStyles() {
    if (document.getElementById('zts-unlock-css')) return;
    var s = document.createElement('style');
    s.id = 'zts-unlock-css';
    s.textContent = [
      /* carte verrouillée — overlay = élément dédié (la carte utilise déjà ::before) */
      '.zts-app-card.zts-locked>*:not(.zts-lock-overlay){filter:saturate(.5) brightness(.9);}',
      '.zts-lock-overlay{position:absolute!important;inset:0!important;z-index:5;border-radius:inherit;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;',
      'pointer-events:none;text-align:center;padding:10px;box-sizing:border-box;',
      'background:linear-gradient(160deg,rgba(26,26,46,.30),rgba(26,26,46,.62));}',
      '.zts-lock-overlay .ico{font-size:42px;line-height:1;filter:drop-shadow(2px 2px 0 rgba(0,0,0,.6));}',
      '.zts-lock-overlay .lab{font-family:var(--font-impact,system-ui);font-size:13px;color:#fff;line-height:1.1;',
      'background:var(--rose,#FF2D87);border:2px solid var(--zts-noir,#1a1a1a);border-radius:999px;',
      'padding:5px 13px;box-shadow:2px 2px 0 var(--zts-noir,#1a1a1a);}',
      /* popup */
      '#zts-unlock{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;',
      'padding:20px;background:rgba(12,22,48,.86);backdrop-filter:blur(4px);font-family:var(--font-body,system-ui);}',
      '#zts-unlock[hidden]{display:none;}',
      '.ztu-card{position:relative;width:100%;max-width:420px;background:#fff;border:var(--bord,3px solid #1a1a1a);',
      'border-radius:var(--r-3,22px);box-shadow:var(--ombre-xl,6px 6px 0 #1a1a1a);padding:28px 24px;text-align:center;}',
      '.ztu-x{position:absolute;top:10px;right:12px;width:34px;height:34px;border-radius:50%;cursor:pointer;',
      'border:2px solid #1a1a1a;background:#fff;font-size:18px;line-height:1;box-shadow:2px 2px 0 #1a1a1a;}',
      '.ztu-badge{display:inline-block;font-family:var(--font-fun,inherit);font-weight:700;font-size:13px;',
      'background:var(--metier,#19B5C9);border:2px solid #1a1a1a;border-radius:999px;padding:3px 12px;margin-bottom:10px;}',
      '.ztu-card h2{font-family:var(--font-impact,Luckiest Guy,system-ui);font-size:clamp(22px,5vw,30px);margin:.2em 0;}',
      '.ztu-sub{font-weight:600;opacity:.85;font-size:15px;margin:0 0 18px;}',
      '.ztu-g,.ztu-sub-btn{width:100%;cursor:pointer;font-family:var(--font-impact,system-ui);}',
      '.ztu-g{display:flex;align-items:center;justify-content:center;gap:10px;font-size:17px;padding:12px;',
      'border:var(--bord,3px solid #1a1a1a);border-radius:999px;background:#fff;box-shadow:var(--ombre,4px 4px 0 #1a1a1a);}',
      '.ztu-or{display:flex;align-items:center;gap:10px;margin:16px 0;color:#777;font-weight:700;font-size:13px;}',
      '.ztu-or::before,.ztu-or::after{content:"";flex:1;height:2px;background:#e3e3ea;}',
      '.ztu-in{width:100%;box-sizing:border-box;font-family:var(--font-body,system-ui);font-weight:600;font-size:15px;',
      'padding:12px 14px;border:2px solid #1a1a1a;border-radius:12px;margin-bottom:10px;}',
      '.ztu-sub-btn{font-size:18px;padding:13px;border:var(--bord,3px solid #1a1a1a);border-radius:999px;',
      'background:var(--metier,#19B5C9);color:#1a1a1a;box-shadow:var(--ombre,4px 4px 0 #1a1a1a);}',
      '.ztu-g:active,.ztu-sub-btn:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #1a1a1a;}',
      '.ztu-toggle{display:inline-block;margin-top:14px;background:none;border:0;cursor:pointer;font-weight:700;',
      'text-decoration:underline;color:#19527a;font-size:14px;}',
      '.ztu-err{color:#c8102e;font-weight:700;font-size:14px;margin:6px 0 0;min-height:1.2em;}',
      '.ztu-busy{opacity:.6;pointer-events:none;}',
      /* blog : contenu réservé */
      '[data-zts-lock="content"].zts-hidden{display:none!important;}',
      '.zts-blog-cta{margin:28px 0;padding:26px 22px;text-align:center;border:var(--bord,3px solid #1a1a1a);',
      'border-radius:var(--r-3,22px);background:linear-gradient(160deg,#E0F7FF,#CFF3FF);box-shadow:var(--ombre,4px 4px 0 #1a1a1a);}',
      '.zts-blog-cta__fade{height:120px;margin-top:-120px;margin-bottom:8px;pointer-events:none;',
      'background:linear-gradient(180deg,rgba(255,255,255,0),#fff);}',
      '.zts-blog-cta h3{font-family:var(--font-impact,system-ui);font-size:clamp(20px,4vw,26px);margin:.1em 0 .25em;}',
      '.zts-blog-cta p{font-weight:600;opacity:.85;margin:0 0 16px;}',
      '.zts-blog-cta button{cursor:pointer;font-family:var(--font-impact,system-ui);font-size:18px;padding:13px 26px;',
      'border:var(--bord,3px solid #1a1a1a);border-radius:999px;background:var(--jaune,#FFEA00);color:#1a1a1a;',
      'box-shadow:var(--ombre,4px 4px 0 #1a1a1a);}',
      '.zts-blog-cta button:active{transform:translate(2px,2px);box-shadow:2px 2px 0 #1a1a1a;}'
    ].join('');
    document.head.appendChild(s);
  }

  /* ---------- VERROUS APPS ---------- */
  function lockCard(card) {
    if (card.classList.contains('zts-locked')) return;
    card.classList.add('zts-locked');
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
    var ov = document.createElement('span');
    ov.className = 'zts-lock-overlay';
    ov.innerHTML = '<span class="ico">🔒</span><span class="lab">' + t().lock + '</span>';
    card.appendChild(ov);
  }
  function unlockCard(card) {
    if (!card.classList.contains('zts-locked')) return;
    card.classList.remove('zts-locked');
    var ov = card.querySelector('.zts-lock-overlay');
    if (ov) ov.remove();
  }
  function refreshLabels() {
    document.querySelectorAll('.zts-lock-overlay .lab').forEach(function (l) { l.textContent = t().lock; });
  }

  function applyAppLocks() {
    document.querySelectorAll('#gridActive').forEach(function (grid) {
      var cards = grid.querySelectorAll('.zts-app-card:not(.is-soon)');
      cards.forEach(function (card, i) {
        if (authed || i < FREE_PER_GRID) unlockCard(card);
        else lockCard(card);
      });
    });
  }

  /* ---------- VERROUS BLOG ---------- */
  function applyBlogLock() {
    document.querySelectorAll('[data-zts-lock="content"]').forEach(function (block) {
      if (authed) {
        block.classList.remove('zts-hidden');
        var cta = block.previousElementSibling;
        if (cta && cta.classList && cta.classList.contains('zts-blog-cta')) cta.remove();
      } else {
        block.classList.add('zts-hidden');
        var prev = block.previousElementSibling;
        if (!(prev && prev.classList && prev.classList.contains('zts-blog-cta'))) {
          var cta = document.createElement('div');
          cta.className = 'zts-blog-cta';
          cta.innerHTML =
            '<div class="zts-blog-cta__fade"></div>' +
            '<h3>' + t().ctaTitle + '</h3><p>' + t().ctaSub + '</p>' +
            '<button type="button">' + t().ctaBtn + '</button>';
          cta.querySelector('button').addEventListener('click', open);
          block.parentNode.insertBefore(cta, block);
        }
      }
    });
  }

  var observer = null, applying = false;
  function observeGrid() {
    if (!observer) return;
    var host = document.getElementById('gridActive');
    if (host) observer.observe(host, { childList: true });   // direct children only
  }
  function applyAll() {
    if (applying) return;                          // anti-réentrance dure
    applying = true;
    if (observer) observer.disconnect();           // n'observe pas nos propres ajouts
    try { applyAppLocks(); applyBlogLock(); refreshLabels(); }
    finally { observeGrid(); applying = false; }
  }

  /* ---------- POPUP ---------- */
  function open(e) { if (e) e.preventDefault(); ensureSdk(); var g = el('zts-unlock'); if (g) { g.hidden = false; render(); } }
  function close() { var g = el('zts-unlock'); if (g) g.hidden = true; }
  function el(id) { return document.getElementById(id); }

  function render() {
    var L = t(), g = el('zts-unlock'); if (!g) return;
    g.innerHTML =
      '<div class="ztu-card" role="dialog" aria-modal="true" aria-label="' + L.title + '">' +
        '<button class="ztu-x" id="ztu-x" aria-label="' + L.close + '">✕</button>' +
        '<span class="ztu-badge">' + L.badge + '</span>' +
        '<h2>' + L.title + '</h2><p class="ztu-sub">' + L.sub + '</p>' +
        '<button class="ztu-g" id="ztu-google"><span style="font-size:20px;">🇬</span>' + L.google + '</button>' +
        '<div class="ztu-or">' + L.or + '</div>' +
        '<input class="ztu-in" id="ztu-email" type="email" autocomplete="email" placeholder="' + L.email + '">' +
        '<input class="ztu-in" id="ztu-pass" type="password" autocomplete="current-password" placeholder="' + L.pass + '">' +
        '<button class="ztu-sub-btn" id="ztu-submit">' + (mode === 'signup' ? L.signup : L.login) + '</button>' +
        '<p class="ztu-err" id="ztu-err"></p>' +
        '<button class="ztu-toggle" id="ztu-toggle">' + (mode === 'signup' ? L.toLogin : L.toSignup) + '</button>' +
      '</div>';
    el('ztu-x').addEventListener('click', close);
    el('ztu-google').addEventListener('click', doGoogle);
    el('ztu-submit').addEventListener('click', doEmail);
    el('ztu-pass').addEventListener('keydown', function (e) { if (e.key === 'Enter') doEmail(); });
    el('ztu-toggle').addEventListener('click', function () { mode = (mode === 'signup') ? 'login' : 'signup'; render(); });
  }
  function showErr(m) { var e = el('ztu-err'); if (e) e.textContent = m || ''; }
  function busy(on) { var c = document.querySelector('#zts-unlock .ztu-card'); if (c) c.classList.toggle('ztu-busy', !!on); }

  function doGoogle() {
    showErr(''); busy(true);
    var p = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(p).catch(function (err) {
      busy(false);
      if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment'))
        firebase.auth().signInWithRedirect(p);
      else showErr(t().errGoogle);
    });
  }
  function doEmail() {
    var L = t();
    var email = (el('ztu-email').value || '').trim(), pass = el('ztu-pass').value || '';
    showErr('');
    if (pass.length < 6) { showErr(L.errPass); return; }
    busy(true);
    var auth = firebase.auth();
    var op = (mode === 'signup') ? auth.createUserWithEmailAndPassword(email, pass)
                                 : auth.signInWithEmailAndPassword(email, pass);
    op.catch(function (err) {
      busy(false);
      var c = err && err.code;
      if (c === 'auth/email-already-in-use') { mode = 'login'; render(); showErr(L.errUsed); }
      else if (c === 'auth/weak-password') showErr(L.errPass);
      else showErr(L.errMail);
    });
  }

  /* ---------- FIREBASE (lazy) ---------- */
  var sdkState = 0; // 0 none, 1 loading, 2 ready
  function ensureSdk() {
    if (location.hash.indexOf('nofb') !== -1) return;   // mode test hors-ligne
    if (sdkState) return;
    sdkState = 1;
    function add(src, next) {
      var s = document.createElement('script'); s.src = src;
      s.onload = next; s.onerror = function () { sdkState = 0; };
      document.head.appendChild(s);
    }
    add('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js', function () {
      add('https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js', initFb);
    });
  }
  function initFb() {
    try {
      sdkState = 2;
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      firebase.auth().getRedirectResult().catch(function () {});
      firebase.auth().onAuthStateChanged(function (user) {
        authed = !!user;
        document.body.classList.toggle('zts-authed', authed);
        if (authed) close();
        applyAll();
        document.dispatchEvent(new CustomEvent('zts:auth', { detail: { user: user } }));
      });
    } catch (e) { sdkState = 0; }
  }

  /* ---------- BOOT ---------- */
  function boot() {
    injectStyles();
    var g = document.createElement('div');
    g.id = 'zts-unlock'; g.hidden = true;
    g.addEventListener('click', function (e) { if (e.target === g) close(); });
    document.body.appendChild(g);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    // Clic sur une carte verrouillée → popup
    document.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('.zts-app-card.zts-locked');
      if (c) { e.preventDefault(); e.stopPropagation(); open(); }
    }, true);

    applyAll();                 // anon par défaut (verrous visibles tout de suite)
    // Firebase chargé APRÈS le load → ne bloque jamais l'affichage de la page
    // (échappatoire test hors-ligne : #nofb dans l'URL saute Firebase)
    if (location.hash.indexOf('nofb') === -1) {
      if (document.readyState === 'complete') ensureSdk();
      else window.addEventListener('load', function () { setTimeout(ensureSdk, 0); });
    }

    // Re-applique après chaque rendu de grille (langue, hub) sans toucher leur JS
    observer = new MutationObserver(function () { applyAll(); });
    observeGrid();
    document.addEventListener('zts:langchange', applyAll);
    document.addEventListener('zts:ready', applyAll);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.ZTS_UNLOCK = { open: open, close: close, refresh: applyAll };
})();
