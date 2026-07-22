/* janusxr.org — progressive enhancements only.
   Everything on this page works with this file missing. */

document.documentElement.classList.add('js');

var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- "JanusXR is ______" typer ------------------------------- */
(function () {
  var list = document.getElementById('janusxr-is-list');
  var typer = document.getElementById('janusxr-is-typer');
  if (!list || !typer) return;

  var items = Array.prototype.map.call(list.querySelectorAll('li'), function (li) {
    return li.textContent;
  });
  if (!items.length) return;

  var idx = Math.floor(Math.random() * items.length);

  if (reducedMotion) {
    // No typing animation: swap the completion whole, slowly.
    typer.textContent = items[idx];
    setInterval(function () {
      idx = (idx + 1) % items.length;
      typer.textContent = items[idx];
    }, 6000);
    return;
  }

  var TYPE_MS = 45, ERASE_MS = 22, HOLD_MS = 2600;

  function type(text, pos) {
    typer.textContent = text.slice(0, pos);
    if (pos < text.length) {
      setTimeout(function () { type(text, pos + 1); }, TYPE_MS);
    } else {
      setTimeout(function () { erase(text, text.length); }, HOLD_MS);
    }
  }

  function erase(text, pos) {
    typer.textContent = text.slice(0, pos);
    if (pos > 0) {
      setTimeout(function () { erase(text, pos - 1); }, ERASE_MS);
    } else {
      idx = (idx + 1) % items.length;
      type(items[idx], 0);
    }
  }

  type(items[idx], 0);
})();

/* --- scroll spy: highlight the active section in the nav ------ */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.site-nav a[href^="#"]'));
  if (!links.length) return;
  var targets = links.map(function (a) {
    return { link: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
  }).filter(function (t) { return t.el; });

  function update() {
    var mid = window.innerHeight / 2;
    var current = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].el.getBoundingClientRect().top <= mid) current = targets[i];
    }
    var doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
      current = targets[targets.length - 1];
    }
    targets.forEach(function (t) {
      t.link.classList.toggle('active', t === current);
    });
  }

  var pending = false;
  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; update(); });
  }, { passive: true });
  update();
})();

/* --- live project activity from GitHub ----------------------- */
(function () {
  var box = document.getElementById('build-activity');
  if (!box || !window.fetch) return;
  var repo = box.getAttribute('data-repo');
  var feed = box.querySelector('.activity-feed');
  var fallback = box.querySelector('.activity-fallback');

  fetch('https://api.github.com/repos/' + repo + '/commits?per_page=5')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (commits) {
      if (!commits.length) return;
      commits.forEach(function (c) {
        var li = document.createElement('li');
        var sha = document.createElement('a');
        sha.className = 'sha';
        sha.href = c.html_url;
        sha.textContent = c.sha.slice(0, 7);
        li.appendChild(sha);
        li.appendChild(document.createTextNode(
          ' ' + c.commit.message.split('\n')[0]
        ));
        feed.appendChild(li);
      });
      feed.hidden = false;
      if (fallback) {
        fallback.textContent = 'Latest commits to ' + repo + ' — ';
        var a = document.createElement('a');
        a.href = 'https://github.com/' + repo;
        a.textContent = 'see it all on GitHub';
        fallback.appendChild(a);
      }
    })
    .catch(function () { /* fallback content already in the DOM */ });
})();
