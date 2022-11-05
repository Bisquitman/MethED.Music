const API_URL = 'http://localhost:3024';

// const dataMusic = [
//   {
//     id: '1',
//     artist: 'The weeknd',
//     track: 'Save your tears',
//     poster: 'img/poster-1.jpg',
//     mp3: './assets/audio/The Weeknd - Save Your Tears.mp3',
//   },
//   {
//     id: '2',
//     artist: 'Imagine Dragons',
//     track: 'Follow You',
//     poster: 'img/poster-2.jpg',
//     mp3: './assets/audio/Imagine Dragons - Follow You.mp3',
//   },
//   {
//     id: '3',
//     artist: 'Tove Lo',
//     track: 'How Long',
//     poster: 'img/poster-3.jpg',
//     mp3: './assets/audio/Tove Lo - How Long.mp3',
//   },
//   {
//     id: '4',
//     artist: 'Tom Odell',
//     track: 'Another Love',
//     poster: 'img/poster-4.jpg',
//     mp3: './assets/audio/Tom Odell - Another Love.mp3',
//   },
//   {
//     id: '5',
//     artist: 'Lana Del Rey',
//     track: 'Born To Die',
//     poster: 'img/poster-5.jpg',
//     mp3: './assets/audio/Lana Del Rey - Born To Die.mp3',
//   },
//   {
//     id: '6',
//     artist: 'Adele',
//     track: 'Hello',
//     poster: 'img/poster-6.jpg',
//     mp3: './assets/audio/Adele - Hello.mp3',
//   },
//   {
//     id: '7',
//     artist: 'Tom Odell',
//     track: "Can't Pretend",
//     poster: 'img/poster-7.jpg',
//     mp3: "./assets/audio/Tom Odell - Can't Pretend.mp3",
//   },
//   {
//     id: '8',
//     artist: 'Lana Del Rey',
//     track: 'Young And Beautiful',
//     poster: 'img/poster-8.jpg',
//     mp3: './assets/audio/Lana Del Rey - Young And Beautiful.mp3',
//   },
//   {
//     id: '9',
//     artist: 'Adele',
//     track: 'Someone Like You',
//     poster: 'img/poster-9.jpg',
//     mp3: './assets/audio/Adele - Someone Like You.mp3',
//   },
//   {
//     id: '10',
//     artist: 'Imagine Dragons',
//     track: 'Natural',
//     poster: 'img/poster-10.jpg',
//     mp3: './assets/audio/Imagine Dragons - Natural.mp3',
//   },
//   {
//     id: '11',
//     artist: 'Drake',
//     track: 'Laugh Now Cry Later',
//     poster: 'img/poster-11.jpg',
//     mp3: './assets/audio/Drake - Laugh Now Cry Later.mp3',
//   },
//   {
//     id: '12',
//     artist: 'Madonna',
//     track: 'Frozen',
//     poster: 'img/poster-12.jpg',
//     mp3: './assets/audio/Madonna - Frozen.mp3',
//   },
// ];
let dataMusic = [];
let playlist = [];

const favouriteList = localStorage.getItem('favourite') ? JSON.parse(localStorage.getItem('favourite')) : [];

const audio = new Audio();
const favouriteBtn = document.querySelector('.header__favourite-btn');
const trackCards = document.getElementsByClassName('track');
const player = document.querySelector('.player');
const catalogContainer = document.querySelector('.catalog__container');
const pauseBtn = document.querySelector('.player__controller-pause');
const stopBtn = document.querySelector('.player__controller-stop');
const prevBtn = document.querySelector('.player__controller-prev');
const nextBtn = document.querySelector('.player__controller-next');
const likeBtn = document.querySelector('.player__controller-like');
const playerProgressInput = document.querySelector('.player__progress-input');
const muteBtn = document.querySelector('.player__controller-mute');
const playerVolumeInput = document.querySelector('.player__volume-input');

const playerTimePassed = document.querySelector('.player__time-passed');
const playerTimeTotal = document.querySelector('.player__time-total');

const searchForm = document.querySelector('.search');

const catalogBtnShowAll = document.createElement('button');
catalogBtnShowAll.className = 'catalog__btn-add';
catalogBtnShowAll.innerHTML = `
  <span>Увидеть всё</span>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z"/>
  </svg>
`;

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

pauseBtn.addEventListener('click', pausePlayer);

stopBtn.addEventListener('click', () => {
  audio.src = '';
  player.classList.remove('player_active');
  document.querySelector('.track_active').classList.remove('track_active');
});

const createCard = (data) => {
  // console.log('data: ', data);
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
  catalogContainer.textContent = '';
  const listCards = dataList.map(createCard);
  catalogContainer.append(...listCards);
  addHandlerTrack();
};

const checkCount = (i = 1) => {
  // trackCards[0];
  if (catalogContainer.clientHeight && catalogContainer.clientHeight > trackCards[0].clientHeight * 3) {
    trackCards[trackCards.length - i].style.display = 'none';
    checkCount(i + 1);
  } else if (i !== 1) {
    catalogContainer.append(catalogBtnShowAll);
  } else if (!catalogContainer.clientHeight) {
    catalogContainer.innerHTML = `
      <h2 class="favourite__title">Избранное</h2>
      <h3 class="favourite__text">0 результатов</h3>
    `;
  }
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

  playerTimePassed.textContent = `${minutesPassed}:${
    secondsPassed < 10 ? '0' + secondsPassed : secondsPassed
  }`;
  playerTimeTotal.textContent = `${minutesDuration}:${
    secondsDuration < 10 ? '0' + secondsDuration : secondsDuration
  }`;
};

const init = async () => {
  audio.volume = +localStorage.getItem('volume') || 0.8;
  playerVolumeInput.value = audio.volume * 100;

  dataMusic = await fetch(`${API_URL}/api/music`).then((data) => data.json())

  renderCatalog(dataMusic);
  checkCount();

  catalogBtnShowAll.addEventListener('click', () => {
    [...trackCards].forEach((trackCard) => {
      trackCard.style.display = '';
      catalogBtnShowAll.remove();
    });
  });

  prevBtn.addEventListener('click', playMusic);
  nextBtn.addEventListener('click', playMusic);

  audio.addEventListener('ended', () => {
    nextBtn.dispatchEvent(new Event('click', {bubbles: true}))
  });

  audio.addEventListener('timeupdate', updateTime);

  playerProgressInput.addEventListener('change', () => {
    const progress = playerProgressInput.value;
    audio.currentTime = (progress / playerProgressInput.max) * audio.duration;
  });

  favouriteBtn.addEventListener('click', () => {
    if (favouriteBtn.classList.contains('header__favourite-btn_active')) {
      favouriteBtn.classList.remove('header__favourite-btn_active');
      renderCatalog(dataMusic);
      checkCount();
    } else {
      favouriteBtn.classList.add('header__favourite-btn_active');
      const data = dataMusic.filter((item) => favouriteList.includes(item.id));
      renderCatalog(data);
      checkCount();
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

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    playlist = await fetch(`${API_URL}/api/music?search=${searchForm.search.value}`).then((data) => data.json())

    renderCatalog(playlist);
    checkCount();
  });
};

init();
