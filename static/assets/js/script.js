/* ============================================================
   stza.io — script.js v1.0
   Nav · Scroll reveal · Theme toggle · Form feedback
   ============================================================ */
(function(){
  'use strict';

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

  /* ── THEME TOGGLE ── */
  var THEME_KEY = 'stza-theme';
  var toggleBtn = document.querySelector('.theme-toggle');
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
  var saved = localStorage.getItem(THEME_KEY);
  if(saved) applyTheme(saved);
  if(toggleBtn){
    toggleBtn.addEventListener('click',function(){
      var current = localStorage.getItem(THEME_KEY)||'system';
      var next = current==='system'?'dark':current==='dark'?'light':'system';
      if(next==='system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY,next);
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
