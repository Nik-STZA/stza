/* ============================================================
   stza.io — script.js v2.0
   Nav · Scroll reveal · Theme toggle · Form feedback
   Cookie consent · GA gating · Consent Mode v2
   ============================================================ */
(function(){
  'use strict';

  /* ── CONSENT HELPERS ── */
  var CONSENT_KEY = 'stza-consent';

  function getConsent(){
    try { return localStorage.getItem(CONSENT_KEY); } catch(e){ return null; }
  }
  function setConsent(value){
    try { localStorage.setItem(CONSENT_KEY, value); } catch(e){}
  }
  function hasFullConsent(){
    return getConsent() === 'all';
  }

  /* ── GOOGLE ANALYTICS — only loads after "Accept all" ── */
  var GA_ID = ''; // Add your GA4 measurement ID here, e.g. 'G-XXXXXXXXXX'
  var gaLoaded = false;

  function loadGA(){
    if(!GA_ID || gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function updateConsentMode(granted){
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    if(granted){
      gtag('consent','update',{
        ad_storage:        'denied',
        ad_user_data:      'denied',
        ad_personalization:'denied',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage:'granted'
      });
    } else {
      gtag('consent','update',{
        ad_storage:        'denied',
        ad_user_data:      'denied',
        ad_personalization:'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage:'denied'
      });
    }
  }

  /* ── SERVER-SIDE CONSENT AUDIT LOG ── */
  function logConsentToServer(choice){
    try {
      var payload = JSON.stringify({
        consent: choice,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      if(navigator.sendBeacon){
        navigator.sendBeacon('/.netlify/functions/consent-log', payload);
      } else {
        fetch('/.netlify/functions/consent-log', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: payload,
          keepalive: true
        }).catch(function(){});
      }
    } catch(e){}
  }

  /* ── COOKIE BANNER ── */
  var banner = document.getElementById('cookie-banner');
  var btnAccept = document.getElementById('cookie-accept');
  var btnEssentials = document.getElementById('cookie-essentials');

  function showBanner(){ if(banner) banner.setAttribute('aria-hidden','false'); }
  function hideBanner(){ if(banner) banner.setAttribute('aria-hidden','true'); }

  function handleConsent(choice){
    setConsent(choice);
    hideBanner();
    var granted = choice === 'all';
    updateConsentMode(granted);
    logConsentToServer(choice);
    if(granted){
      loadGA();
    }
    // Re-apply theme to respect new consent state
    applyTheme(getCurrentTheme());
  }

  // On page load — check existing consent
  var existingConsent = getConsent();
  if(!existingConsent){
    showBanner();
  } else {
    updateConsentMode(existingConsent === 'all');
    if(existingConsent === 'all'){
      loadGA();
    }
  }

  if(btnAccept){
    btnAccept.addEventListener('click', function(){ handleConsent('all'); });
  }
  if(btnEssentials){
    btnEssentials.addEventListener('click', function(){ handleConsent('essentials'); });
  }

  /* ── MOBILE NAV ── */
  var ham = document.querySelector('.nav-hamburger');
  var mob = document.querySelector('.nav-mobile');
  if(ham && mob){
    ham.addEventListener('click',function(){
      var open = mob.classList.toggle('open');
      ham.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click',function(e){
      if(!ham.contains(e.target) && !mob.contains(e.target)){
        mob.classList.remove('open');
        ham.setAttribute('aria-expanded','false');
      }
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'){mob.classList.remove('open');ham.setAttribute('aria-expanded','false');}
    });
  }

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var target = document.querySelector(a.getAttribute('href'));
      if(target){
        e.preventDefault();
        if(mob) mob.classList.remove('open');
        target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });

  /* ── ACTIVE NAV (highlight on scroll) ── */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  if(sections.length && 'IntersectionObserver' in window){
    var sio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(a){
            a.classList.toggle('active', a.getAttribute('href')==='#'+id);
          });
        }
      });
    },{threshold:0.35});
    sections.forEach(function(s){sio.observe(s);});
  }

  /* ── SCROLL REVEAL ── */
  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && reveals.length){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    },{threshold:0.1});
    reveals.forEach(function(el){io.observe(el);});
  } else {
    reveals.forEach(function(el){el.classList.add('revealed');});
  }

  /* ── THEME TOGGLE (consent-aware) ── */
  var THEME_KEY = 'stza-theme';
  var toggleBtn = document.querySelector('.theme-toggle');
  var sessionTheme = null; // holds theme when consent is essentials-only

  function getCurrentTheme(){
    if(hasFullConsent()){
      try { return localStorage.getItem(THEME_KEY) || 'system'; } catch(e){ return 'system'; }
    }
    return sessionTheme || 'system';
  }

  function applyTheme(theme){
    if(theme==='dark'){
      document.documentElement.setAttribute('data-theme','dark');
      if(toggleBtn) toggleBtn.textContent='☀ Light';
    } else if(theme==='light'){
      document.documentElement.setAttribute('data-theme','light');
      if(toggleBtn) toggleBtn.textContent='☽ Dark';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if(toggleBtn) toggleBtn.textContent='◑ Auto';
    }
  }

  // Load saved theme (only from localStorage if full consent)
  if(hasFullConsent()){
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
    if(saved) applyTheme(saved);
  }

  if(toggleBtn){
    toggleBtn.addEventListener('click',function(){
      var current = getCurrentTheme();
      var next = current==='system'?'dark':current==='dark'?'light':'system';
      if(hasFullConsent()){
        try {
          if(next==='system') localStorage.removeItem(THEME_KEY);
          else localStorage.setItem(THEME_KEY,next);
        } catch(e){}
      } else {
        // Session-only — don't persist
        sessionTheme = next === 'system' ? null : next;
      }
      applyTheme(next);
    });
  }

  /* ── CONTACT FORM (Netlify) ── */
  var form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('.form-submit');
      var origText = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;

      var data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams(data).toString()
      })
      .then(function(res){
        if(res.ok){
          form.style.display = 'none';
          var success = document.getElementById('form-success');
          if(success) success.style.display = 'block';
        } else {
          throw new Error('Network error');
        }
      })
      .catch(function(){
        btn.textContent = origText;
        btn.disabled = false;
        alert('Something went wrong - please email hello@stza.io directly.');
      });
    });
  }

}());
