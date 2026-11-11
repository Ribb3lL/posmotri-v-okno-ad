/* КОНФИГ */
const preloaderWaitindTime = 1200;
const cardsOnPage = 5;
const BASE_URL = '';
const endpoint = '';

/* ЭЛЕМЕНТЫ СТРАНИЦЫ */
const cardsList = document.querySelector('.content__list');
const cardsContainer = document.querySelector('.content__list-container');
const videoContainer = document.querySelector('.result__video-container');
const videoElement = document.querySelector('.result__video');
const form = document.querySelector('form');

/* ТЕМПЛЕЙТЫ */
const cardTmp = document.querySelector('.cards-list-item-template');
const preloaderTmp = document.querySelector('.preloader-template');
const videoNotFoundTmp = document.querySelector('.error-template');
const moreButtonTmp = document.querySelector('.more-button-template');

/* МЕХАНИКА */

// Нужен для работы с переключателями
let cardsOnPageState = [];

// База данных трасс Формулы-1
const f1TracksDatabase = [
  {
    id: 1,
    city: 'Италия',
    description: 'Monza - самая скоростная трасса, известная как "Храм скорости"',
    video: {
      url: 'https://auto.vercity.ru/img/news/old/10133.jpg',
    },
    poster: {
      url: 'https://auto.vercity.ru/img/news/old/10133.jpg',
    },
    thumbnail: {
      url: 'https://auto.vercity.ru/img/news/old/10133.jpg',
    },
  },
  {
    id: 2,
    city: 'Монако',
    description: 'Monte Carlo - самая медленная и узкая городская трасса',
    video: {
      url: 'https://wikiway.com/upload/iblock/334/vpdjcey6z9ft36mkj1463gzr7vd8wf1l/Fairmont-Monte-Carlo-2.jpg',
    },
    poster: {
      url: 'https://wikiway.com/upload/iblock/334/vpdjcey6z9ft36mkj1463gzr7vd8wf1l/Fairmont-Monte-Carlo-2.jpg',
    },
    thumbnail: {
      url: 'https://wikiway.com/upload/iblock/334/vpdjcey6z9ft36mkj1463gzr7vd8wf1l/Fairmont-Monte-Carlo-2.jpg',
    },
  },
  {
    id: 3,
    city: 'Британия',
    description: 'Silverstone - бывший аэродром, принявший первую гонку в истории Формулы-1',
    video: {
      url: 'https://f1report.ru/img/fotos/2016/07/f1-1468027861.jpg',
    },
    poster: {
      url: 'https://f1report.ru/img/fotos/2016/07/f1-1468027861.jpg',
    },
    thumbnail: {
      url: 'https://f1report.ru/img/fotos/2016/07/f1-1468027861.jpg',
    },
  },
  {
    id: 4,
    city: 'Бельгия',
    description: 'SPA — одна из самых длинных трасс со знаменитым перепадом высот',
    video: {
      url: 'https://static.tildacdn.com/tild3936-3633-4536-b934-363336653333/4.jpg',
    },
    poster: {
      url: 'https://static.tildacdn.com/tild3936-3633-4536-b934-363336653333/4.jpg',
    },
    thumbnail: {
      url: 'https://static.tildacdn.com/tild3936-3633-4536-b934-363336653333/4.jpg',
    },
  },
  {
    id: 5,
    city: 'Япония',
    description: 'Suzuka - уникальная скоростная трасса в форме восьмерки',
    video: {
      url: 'https://cs14.pikabu.ru/post_img/big/2023/09/21/8/1695301102249716138.jpg',
    },
    poster: {
      url: 'https://cs14.pikabu.ru/post_img/big/2023/09/21/8/1695301102249716138.jpg',
    },
    thumbnail: {
      url: 'https://cs14.pikabu.ru/post_img/big/2023/09/21/8/1695301102249716138.jpg',
    },
  },
];

// Первая загрузка ✅
showPreloader(preloaderTmp, videoContainer);
showPreloader(preloaderTmp, cardsContainer);
mainMechanics(endpoint);

// Осуществляется поиск ✅
form.onsubmit = (e) => {
  e.preventDefault();

  cardsList.textContent = '';
  const buttonInDOM = cardsContainer.querySelector('.more-button');
  if (buttonInDOM) {
    buttonInDOM.remove();
  }

  [...videoContainer.children].forEach((el) => {
    el.className === 'error' && el.remove();
  });

  showPreloader(preloaderTmp, videoContainer);
  showPreloader(preloaderTmp, cardsContainer);

  const formData = serializeFormData(form);
  const requestUrl = generateFilterRequest(
    endpoint,
    formData.city,
    formData.timeArray
  );

  mainMechanics(requestUrl);
};

/* ФУНКЦИЯ, КОТОРАЯ ВСЕ ГЕНЕРИТ */

async function mainMechanics(endpoint) {
  try {
    // Фильтрация локальных данных в обход недоступного сервера
    const formData = serializeFormData(form);
    const filteredTracks = f1TracksDatabase.filter((item) => {
      if (!formData.city) return true;
      return item.city.toLowerCase().includes(formData.city.toLowerCase());
    });

    const data = {
      results: filteredTracks,
      pagination: {
        page: 1,
        pageCount: 1,
      },
    };

    cardsOnPageState = data.results;

    if (!data?.results?.[0]) {
      throw new Error('not-found');
    }

    appendCards({
      baseUrl: BASE_URL,
      dataArray: data.results,
      cardTmp,
      container: cardsList,
    });

    setVideo({
      baseUrl: BASE_URL,
      video: videoElement,
      videoUrl: data.results[0].video.url,
      posterUrl: data.results[0].poster.url,
    });

    document
      .querySelectorAll('.content__card-link')[0]
      .classList.add('content__card-link_current');

    await waitForReadyVideo(videoElement);
    await delay(preloaderWaitindTime);
    removePreloader(videoContainer, '.preloader');
    removePreloader(cardsContainer, '.preloader');

    // Добавляем класс для стилизации скроллбара
    cardsContainer.classList.add('custom-scrollbar');

    chooseCurrentVideo({
      baseUrl: BASE_URL,
      videoData: cardsOnPageState,
      cardLinksSelector: '.content__card-link',
      currentLinkClassName: 'content__card-link_current',
      mainVideo: videoElement,
    });

    showMoreCards({
      dataArray: data,
      buttonTemplate: moreButtonTmp,
      cardsList,
      buttonSelector: '.more-button',
      initialEndpoint: endpoint,
      baseUrl: BASE_URL,
      cardTmp: cardTmp,
    });
  } catch (err) {
    if (err.message === 'not-found') {
      showError(videoContainer, videoNotFoundTmp, 'Нет подходящих видео =(');
    } else {
      showError(videoContainer, videoNotFoundTmp, 'Ошибка получения данных :(');
    }
    console.log(err);
    removePreloader(videoContainer, '.preloader');
    removePreloader(cardsContainer, '.preloader');
  }
}

/* УТИЛИТЫ */

// Простой промис, чтобы легче ставить паузу ✅
async function delay(ms) {
  return await new Promise((resolve) => {
    return setTimeout(resolve, ms);
  });
}

// Промис, который резолвится, если видео готово к проигрыванию
async function waitForReadyVideo(video) {
  return await new Promise((resolve) => {
    if (video.readyState >= 3) {
      return resolve();
    }
    video.oncanplaythrough = resolve;
    video.onerror = resolve; // Страховка от зависания интерфейса
    setTimeout(resolve, 1500); // Таймаут, чтобы плеер не блокировал экран
  });
}

// Устанавливает прелоадер на время загрузки данных ✅
function showPreloader(tmp, parent) {
  const node = tmp.content.cloneNode(true);
  parent.append(node);
  console.log('показал прелоадер');
}

// Убирает прелоадер из DOM ✅
function removePreloader(parent, preloaderSelector) {
  const preloader = parent.querySelector(preloaderSelector);
  if (preloader) {
    preloader.remove();
  }

  console.log('убрал прелоадер');
}

// Добавляет карточки в контейнер, собирая их из данных API ✅
function appendCards({ baseUrl, dataArray, cardTmp, container }) {
  dataArray.forEach((el) => {
    const node = cardTmp.content.cloneNode(true);
    node.querySelector('a').setAttribute('id', el.id);
    node.querySelector('.content__video-card-title').textContent = el.city;
    node.querySelector('.content__video-card-description').textContent =
      el.description;
    node
      .querySelector('.content__video-card-thumbnail')
      .setAttribute('src', `${baseUrl}${el.thumbnail.url}`);
    node
      .querySelector('.content__video-card-thumbnail')
      .setAttribute('alt', el.description);
    container.append(node);
  });
  console.log('Сгенерировал карточки');
}

// Устанавливает нужное видео в контейнер ✅
function setVideo({ baseUrl, video, videoUrl, posterUrl }) {
  video.setAttribute('src', `${baseUrl}${videoUrl}`);
  video.setAttribute('poster', `${baseUrl}${posterUrl}`);
  console.log('Подставил видео в основной блок');
}

// Получает данные из формы и сериализует как надо ✅
function serializeFormData(form) {
  const city = form.querySelector('input[name="city"]');
  const checkboxes = form.querySelectorAll('input[name="time"]');
  const checkedValuesArray = [...checkboxes].reduce((acc, item) => {
    item.checked && acc.push(item.value);
    return acc;
  }, []);
  console.log('Собрал данные формы в объект');
  return {
    city: city ? city.value.trim() : '',
    timeArray: checkedValuesArray,
  };
}

// Генерирует строку с фильтрами запросов в API в зависимости от данных из формы ✅
function generateFilterRequest(endpoint, city, timeArray) {
  if (city) {
    endpoint += `filters[city][$containsi]=${city}&`;
  }
  if (timeArray) {
    timeArray.forEach((timeslot) => {
      endpoint += `filters[time_of_day][$eqi]=${timeslot}&`;
    });
  }
  console.log('Сгенерировал строку адреса запроса в API из данных формы');
  return endpoint;
}

// Переключает текущее видео ✅
function chooseCurrentVideo({
  baseUrl,
  videoData,
  cardLinksSelector,
  currentLinkClassName,
  mainVideo,
}) {
  const cardsList = document.querySelectorAll(cardLinksSelector);
  if (cardsList) {
    cardsList.forEach((item) => {
      item.onclick = async (e) => {
        e.preventDefault();
        cardsList.forEach((item) => {
          item.classList.remove(currentLinkClassName);
        });
        item.classList.add(currentLinkClassName);
        showPreloader(preloaderTmp, videoContainer);
        const vidoObj = videoData.find(
          (video) => String(video.id) === String(item.id)
        );
        setVideo({
          baseUrl,
          video: mainVideo,
          videoUrl: vidoObj.video.url,
          posterUrl: vidoObj.poster.url,
        });
        await waitForReadyVideo(mainVideo);
        await delay(preloaderWaitindTime);
        removePreloader(videoContainer, '.preloader');
        console.log('Переключил видео');
      };
    });
  }
}

// Вывожу интерфейс, когда видео не найдено ✅
function showError(container, errorTemplate, errorMessage) {
  const node = errorTemplate.content.cloneNode(true);
  node.querySelector('.error__title').textContent = errorMessage;
  container.append(node);
  console.log('показал ошибку');
}

// Вывожу больше видео, если в пагинации больше страниц, чем показано
function showMoreCards({
  dataArray,
  buttonTemplate,
  cardsList,
  buttonSelector,
  initialEndpoint,
  baseUrl,
  cardTmp,
}) {
  if (dataArray.pagination.page === dataArray.pagination.pageCount) return;

  const button = buttonTemplate.content.cloneNode(true);
  cardsContainer.append(button);

  const buttonInDOM = cardsContainer.querySelector(buttonSelector);
  if (!buttonInDOM) return;

  buttonInDOM.addEventListener('click', async () => {
    let currentPage = dataArray.pagination.page;
    let urlToFetch = `${initialEndpoint}pagination[page]=${(currentPage += 1)}&`;
    try {
      let data = await (await fetch(urlToFetch)).json();
      buttonInDOM.remove();
      cardsOnPageState = cardsOnPageState.concat(data.results);
      appendCards({
        baseUrl,
        dataArray: data.results,
        cardTmp,
        container: cardsList,
      });
      chooseCurrentVideo({
        baseUrl: BASE_URL,
        videoData: cardsOnPageState,
        cardLinksSelector: '.content__card-link',
        currentLinkClassName: 'content__card-link_current',
        mainVideo: videoElement,
      });
      showMoreCards({
        dataArray: data,
        buttonTemplate,
        cardsList,
        buttonSelector,
        initialEndpoint,
        baseUrl,
        cardTmp,
      });
    } catch (err) {
      return err;
    }
  });
}