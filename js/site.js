/* janusxr.org — site enhancements as custom elements.
   Everything here is progressive: each element's light-DOM children are the
   complete no-JS content (Tier 0 gets the full reading), and the elements
   only decorate. The page works with this file missing. */

document.documentElement.classList.add('js');

var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* <janus-webpage-typer prefix="JanusXR is ">
     <ul>…completions…</ul>
   </janus-webpage-typer>
   Types and erases completions pulled from its own list. Without JS the list
   itself is the content — readers get more, not less. */
class JanusWebpageTyper extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;

    var list = this.querySelector('ul, ol');
    if (!list) return;
    this.items = Array.prototype.map.call(list.querySelectorAll('li'), function (li) {
      return li.textContent;
    });
    if (!this.items.length) return;

    var line = document.createElement('p');
    line.className = 'janusxr-is-line';
    line.setAttribute('aria-hidden', 'true');
    line.append(this.getAttribute('prefix') || '');
    this.typer = document.createElement('span');
    this.typer.className = 'typer';
    line.appendChild(this.typer);
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    line.appendChild(cursor);
    this.prepend(line);

    this.idx = Math.floor(Math.random() * this.items.length);

    if (reducedMotion) {
      /* no typing animation: swap the completion whole, slowly */
      this.typer.textContent = this.items[this.idx];
      this._timer = setInterval(() => {
        this.idx = (this.idx + 1) % this.items.length;
        this.typer.textContent = this.items[this.idx];
      }, 6000);
      return;
    }

    this.TYPE_MS = 45; this.ERASE_MS = 22; this.HOLD_MS = 2600;
    this._type(this.items[this.idx], 0);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    clearTimeout(this._timeout);
  }

  _type(text, pos) {
    this.typer.textContent = text.slice(0, pos);
    this._timeout = pos < text.length
      ? setTimeout(() => this._type(text, pos + 1), this.TYPE_MS)
      : setTimeout(() => this._erase(text, text.length), this.HOLD_MS);
  }

  _erase(text, pos) {
    this.typer.textContent = text.slice(0, pos);
    if (pos > 0) {
      this._timeout = setTimeout(() => this._erase(text, pos - 1), this.ERASE_MS);
    } else {
      this.idx = (this.idx + 1) % this.items.length;
      this._type(this.items[this.idx], 0);
    }
  }
}

/* <janus-webpage-scrollspy> … <a href="#…"> … </janus-webpage-scrollspy>
   Highlights whichever child link's target section owns the viewport midline
   (last section wins at the very bottom of the page). */
class JanusWebpageScrollSpy extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;

    this.targets = Array.prototype.slice.call(this.querySelectorAll('a[href^="#"]'))
      .map(function (a) {
        return { link: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
      })
      .filter(function (t) { return t.el; });
    if (!this.targets.length) return;

    var pending = false;
    this._onScroll = () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; this._update(); });
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._update();
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._onScroll);
  }

  _update() {
    var mid = window.innerHeight / 2;
    var current = null;
    this.targets.forEach(function (t) {
      if (t.el.getBoundingClientRect().top <= mid) current = t;
    });
    var doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) {
      current = this.targets[this.targets.length - 1];
    }
    this.targets.forEach(function (t) {
      t.link.classList.toggle('active', t === current);
    });
  }
}

/* <janus-webpage-githubactivity repo="owner/name">
     …fallback content… <ul class="activity-feed" hidden></ul>
   </janus-webpage-githubactivity>
   Fills its feed list with the repo's latest commits; the fallback children
   already say everything a reader needs if the fetch never lands. */
class JanusWebpageGithubActivity extends HTMLElement {
  connectedCallback() {
    if (this._wired) return;
    this._wired = true;

    var repo = this.getAttribute('repo');
    var feed = this.querySelector('.activity-feed');
    if (!repo || !feed || !window.fetch) return;

    fetch('https://api.github.com/repos/' + repo + '/commits?per_page=5')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then((commits) => {
        if (!commits.length) return;
        commits.forEach(function (c) {
          var li = document.createElement('li');
          var sha = document.createElement('a');
          sha.className = 'sha';
          sha.href = c.html_url;
          sha.textContent = c.sha.slice(0, 7);
          li.appendChild(sha);
          li.appendChild(document.createTextNode(' ' + c.commit.message.split('\n')[0]));
          feed.appendChild(li);
        });
        feed.hidden = false;
        var fallback = this.querySelector('.activity-fallback');
        if (fallback) {
          fallback.textContent = 'Latest commits to ' + repo + ' — ';
          var a = document.createElement('a');
          a.href = 'https://github.com/' + repo;
          a.textContent = 'see it all on GitHub';
          fallback.appendChild(a);
        }
      })
      .catch(function () { /* fallback content already in the DOM */ });
  }
}

customElements.define('janus-webpage-typer', JanusWebpageTyper);
customElements.define('janus-webpage-scrollspy', JanusWebpageScrollSpy);
customElements.define('janus-webpage-githubactivity', JanusWebpageGithubActivity);
