import { H as Hls } from './hls-vendor-dru42stk.js';

const selectAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileNavigation() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener('click', () => {
    nav.hidden = !nav.hidden;
  });
}

function initGlobalSearch() {
  const forms = selectAll('[data-global-search-form]');

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const target = query ? `./all-movies.html?q=${encodeURIComponent(query)}` : './all-movies.html';
      window.location.href = target;
    });
  });
}

function filterCards(query) {
  const normalized = query.trim().toLowerCase();
  const cards = selectAll('[data-movie-card]');
  let visibleCount = 0;

  cards.forEach((card) => {
    const haystack = (card.getAttribute('data-search') || '').toLowerCase();
    const visible = !normalized || haystack.includes(normalized);
    card.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });

  const empty = document.querySelector('[data-no-results]');
  if (empty) {
    empty.hidden = visibleCount !== 0;
  }
}

function initLocalSearch() {
  const form = document.querySelector('[data-local-search-form]');
  const input = document.querySelector('[data-local-search]');

  if (!form || !input) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';
  if (initialQuery) {
    input.value = initialQuery;
    filterCards(initialQuery);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    filterCards(input.value);
  });

  input.addEventListener('input', () => {
    filterCards(input.value);
  });
}

function initHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  const slides = selectAll('[data-hero-slide]', slider);
  const dots = selectAll('[data-hero-dot]', slider);
  let current = 0;

  const show = (next) => {
    current = (next + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const active = index === current;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === current);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.getAttribute('data-hero-dot') || 0));
    });
  });

  if (slides.length > 1) {
    window.setInterval(() => show(current + 1), 5200);
  }
}

function initPlayers() {
  const players = selectAll('[data-player]');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-player-overlay]');
    const errorBox = player.querySelector('[data-player-error]');
    const source = player.getAttribute('data-src');
    let hls = null;
    let bound = false;

    if (!video || !overlay || !source) {
      return;
    }

    const showError = (message) => {
      if (errorBox) {
        errorBox.textContent = message;
        errorBox.hidden = false;
      }
    };

    const bindSource = () => {
      if (bound) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        bound = true;
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            showError('视频加载失败，请稍后重试。');
          }
        });
        bound = true;
        return;
      }

      showError('当前浏览器暂不支持该播放格式。');
    };

    const play = async () => {
      bindSource();
      try {
        await video.play();
        player.classList.add('is-playing');
      } catch (error) {
        showError('播放未能自动开始，请再次点击播放按钮。');
      }
    };

    overlay.addEventListener('click', play);
    video.addEventListener('play', () => player.classList.add('is-playing'));
    video.addEventListener('pause', () => player.classList.remove('is-playing'));
    video.addEventListener('ended', () => player.classList.remove('is-playing'));

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
}

function initPlayerScrollLinks() {
  const links = selectAll('[data-scroll-player]');
  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const player = document.querySelector('[data-player]');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

initMobileNavigation();
initGlobalSearch();
initLocalSearch();
initHeroSlider();
initPlayers();
initPlayerScrollLinks();
