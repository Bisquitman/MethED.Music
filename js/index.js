(() => {
  const API_URL = 'http://192.168.1.2:3024';

// Функция throttle будет принимать 2 аргумента:
// - callee, функция, которую надо вызывать;
// - timeout, интервал в мс, с которым следует пропускать вызовы.
  function throttle(callee, timeout) {
    // Таймер будет определять,
    // надо ли нам пропускать текущий вызов.
    let timer = null

    // Как результат возвращаем другую функцию.
    // Это нужно, чтобы мы могли не менять другие части кода,
    // чуть позже мы увидим, как это помогает.
    return function perform(...args) {
      // Если таймер есть, то функция уже была вызвана,
      // и значит новый вызов следует пропустить.
      if (timer) return

      // Если таймера нет, значит мы можем вызвать функцию:
      timer = setTimeout(() => {
        // Аргументы передаём неизменными в функцию-аргумент:
        callee(...args)

        // По окончании очищаем таймер:
        clearTimeout(timer)
        timer = null
      }, timeout)
    }
  }

  let dataMusic = [];
  let playlist = [];

  const favouriteList = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];

  const audio = new Audio();

  const headerLogo = document.querySelector('.header__logo');
  const searchForm = document.querySelector('.search');
  const favouriteBtn = document.querySelector('.header__favourite-btn');

  const trackCards = document.getElementsByClassName('track');
  const catalogContainer = document.querySelector('.catalog__container');

  const player = document.querySelector('.player');
  const pauseBtn = document.querySelector('.player__controller-pause');
  const stopBtn = document.querySelector('.player__controller-stop');
  const prevBtn = document.querySelector('.player__controller-prev');
  const nextBtn = document.querySelector('.player__controller-next');
  const likeBtn = document.querySelector('.player__controller-like');
  const playerProgressInput = document.querySelector('.player__progress-input');
  const trackTitle = document.querySelector('.track-info__title');
  const trackArtist = document.querySelector('.track-info__artist');
  const muteBtn = document.querySelector('.player__controller-mute');
  const playerVolumeInput = document.querySelector('.player__volume-input');
  const playerTimePassed = document.querySelector('.player__time-passed');
  const playerTimeTotal = document.querySelector('.player__time-total');

  const pausePlayer = () => {
    const trackActive = document.querySelector('.track_active');

    if (audio.paused) {
      audio.play();
      pauseBtn.classList.remove('player__icon_play');
      trackActive.classList.remove('track_pause');
    } else {
      audio.pause();
      pauseBtn.classList.add('player__icon_play');
      trackActive.classList.add('track_pause');
    }
  };

  const playMusic = (e) => {
    e.preventDefault();
    const currentTrack = e.currentTarget;

    if (currentTrack.classList.contains('track_active')) {
      pausePlayer();
      return;
    }

    let i = 0;
    const id = currentTrack.dataset.idTrack;

    const index = favouriteList.indexOf(id);
    if (index !== -1) {
      likeBtn.classList.add('player__icon_like_active');
    } else {
      likeBtn.classList.remove('player__icon_like_active');
    }

    const track = playlist.find((item, index) => {
      i = index;
      return id === item.id;
    });

    audio.src = `${API_URL}/${track.mp3}`;
    trackTitle.textContent = track.track;
    trackArtist.textContent = track.artist;

    audio.play();

    pauseBtn.classList.remove('player__icon_play');
    player.classList.add('player_active');
    player.dataset.idTrack = id;

    const prevTrack = i === 0 ? playlist.length - 1 : i - 1;
    const nextTrack = i + 1 === playlist.length ? 0 : i + 1;
    prevBtn.dataset.idTrack = playlist[prevTrack].id;
    nextBtn.dataset.idTrack = playlist[nextTrack].id;
    likeBtn.dataset.idTrack = id;

    for (let i = 0; i < trackCards.length; i++) {
      if (id === trackCards[i].dataset.idTrack) {
        trackCards[i].classList.add('track_active');
      } else {
        trackCards[i].classList.remove('track_active');
      }
    }
  };

  const addHandlerTrack = () => {
    for (let i = 0; i < trackCards.length; i++) {
      trackCards[i].addEventListener('click', playMusic);
    }
  };

  const createCard = (data) => {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'catalog__item track';

    if (player.dataset.idTrack === data.id) {
      card.classList.add('track_active');
      if (audio.paused) {
        card.classList.add('track_pause');
      }
    }

    card.dataset.idTrack = data.id;
    card.innerHTML = `
    <div class="track__img-wrapper">
      <img
        src="${API_URL}/${data.poster}"
        alt="${data.artist} - ${data.track}"
        class="track__poster"
        width="180"
        height="180">
    </div>

    <div class="track__info track-info">
      <p class="track-info__title">${data.track}</p>
      <p class="track-info__artist">${data.artist}</p>
    </div>
  `;

    return card;
  };

  const renderCatalog = (dataList) => {
    playlist = [...dataList];
    if (!playlist.length) {
      catalogContainer.innerHTML = `
      <h2 class="favourite__title">Избранное</h2>
      <h3 class="favourite__text">0 результатов</h3>
    `;
      return;
    }

    catalogContainer.textContent = '';

    const listCards = dataList.map(createCard);
    catalogContainer.append(...listCards);
    addHandlerTrack();

    const catalogBtnShowAll = createCatalogBtn();
    checkCount(catalogBtnShowAll);
  };

  const checkCount = (catalogBtnShowAll, i = 1) => {
    if (catalogContainer.clientHeight && catalogContainer.clientHeight + 20 > trackCards[0].clientHeight * 3) {
      trackCards[trackCards.length - i].style.display = 'none';
      return checkCount(catalogBtnShowAll, i + 1);
    }

    if (i !== 1) {
      catalogContainer.append(catalogBtnShowAll);
    }

    searchForm.reset();
  };

  const updateTime = () => {
    const duration = audio.duration;
    const currentTime = audio.currentTime;
    const progress = (currentTime / duration) * playerProgressInput.max;

    playerProgressInput.value = progress ? progress : 0;

    const minutesPassed = Math.floor(currentTime / 60) || '0';
    const secondsPassed = Math.floor(currentTime % 60) || '0';

    const minutesDuration = Math.floor(duration / 60) || '0';
    const secondsDuration = Math.floor(duration % 60) || '0';

    playerTimePassed.textContent = `${minutesPassed}:${secondsPassed < 10 ? '0' + secondsPassed : secondsPassed}`;
    playerTimeTotal.textContent = `${minutesDuration}:${secondsDuration < 10 ? '0' + secondsDuration : secondsDuration}`;
  };

  const createCatalogBtn = () => {
    const catalogBtnShowAll = document.createElement('button');
    catalogBtnShowAll.className = 'catalog__btn-add';
    catalogBtnShowAll.innerHTML = `
      <span>Увидеть всё</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
      </svg>
    `;

    catalogBtnShowAll.addEventListener('click', () => {
      [...trackCards].forEach((trackCard) => {
        trackCard.style.display = '';
        catalogBtnShowAll.remove();
      });
    });

    return catalogBtnShowAll;
  };

  const eventListeners = () => {
    prevBtn.addEventListener('click', playMusic);
    nextBtn.addEventListener('click', playMusic);

    audio.addEventListener('ended', () => {
      nextBtn.dispatchEvent(new Event('click', {bubbles: true}))
    });

    const updateTimeThrottle = throttle(updateTime, 500);
    audio.addEventListener('timeupdate', updateTimeThrottle);

    playerProgressInput.addEventListener('change', () => {
      const progress = playerProgressInput.value;
      audio.currentTime = (progress / playerProgressInput.max) * audio.duration;
    });

    favouriteBtn.addEventListener('click', (catalogBtnShowAll) => {
      if (favouriteBtn.classList.contains('header__favourite-btn_active')) {
        favouriteBtn.classList.remove('header__favourite-btn_active');
        renderCatalog(dataMusic);
      } else {
        favouriteBtn.classList.add('header__favourite-btn_active');
        const data = dataMusic.filter((item) => favouriteList.includes(item.id));
        renderCatalog(data);
      }

      // TODO Заголовок Избранное при рендере списка избранных.
    });

    headerLogo.addEventListener('click', (catalogBtnShowAll) => {
      renderCatalog(dataMusic);
      if (favouriteBtn.classList.contains('header__favourite-btn_active')) {
        favouriteBtn.classList.remove('header__favourite-btn_active');
      }
    });

    likeBtn.addEventListener('click', () => {
      const index = favouriteList.indexOf(likeBtn.dataset.idTrack);

      if (index === -1) {
        favouriteList.push(likeBtn.dataset.idTrack);
        likeBtn.classList.add('player__icon_like_active');
      } else {
        favouriteList.splice(index, 1);
        likeBtn.classList.remove('player__icon_like_active');
      }

      localStorage.setItem('favourite', JSON.stringify(favouriteList));
    });

    playerVolumeInput.addEventListener('input', () => {
      const value = playerVolumeInput.value;
      audio.volume = value / 100;
      localStorage.setItem('volume', JSON.stringify(audio.volume));
    });

    muteBtn.addEventListener('click', () => {
      if (audio.volume) {
        localStorage.setItem('volume', JSON.stringify(audio.volume));
        audio.volume = 0;
        playerVolumeInput.value = 0;
        muteBtn.classList.add('player__icon_mute-off');
      } else {
        audio.volume = +localStorage.getItem('volume');
        muteBtn.classList.remove('player__icon_mute-off');
        playerVolumeInput.value = audio.volume * 100;
      }
    });

    pauseBtn.addEventListener('click', pausePlayer);

    stopBtn.addEventListener('click', () => {
      audio.src = '';
      player.classList.remove('player_active');
      document.querySelector('.track_active').classList.remove('track_active');
    });

    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      fetch(`${API_URL}/api/music?search=${searchForm.search.value}`)
        .then((data) => data.json())
        .then(renderCatalog)
        .finally(searchForm.reset());
    });
  };

  const init = () => {
    audio.volume = +localStorage.getItem('volume') || 0.8;
    playerVolumeInput.value = audio.volume * 100;

    fetch(`${API_URL}/api/music`)
      .then((data) => data.json())
      .then(renderCatalog)
      .finally(eventListeners);
  };

  init();
})();