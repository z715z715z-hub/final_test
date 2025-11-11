// ===== DOM =====
const cityInput = document.querySelector('#cityInput');
const searchBtn = document.querySelector('#searchBtn');
const locationBtn = document.querySelector('#locationBtn');
const langSelect = document.querySelector('#langSelect');

const cityName = document.querySelector('#cityName');
const temperature = document.querySelector('#temperature');
const description = document.querySelector('#description');
const humidity = document.querySelector('#humidity');
const wind = document.querySelector('#wind');
const airQuality = document.querySelector('#airQuality');
const weatherIcon = document.querySelector('#weatherIcon');

const forecastCards = document.querySelector('#forecastCards');

const unitBtn = document.querySelector('#unitBtn');
const recentList = document.querySelector('#recentList');
const recentSection = document.querySelector('#recentSection');

const travelTipsEl = document.querySelector('#travelTips');
const outfitAdviceEl = document.querySelector('#outfitAdvice');
const catMessage = document.querySelector('#catMessage');

// 타이틀/라벨들 (다국어 변경용)
const appTitle = document.querySelector('#appTitle');
const recentTitle = document.querySelector('#recentTitle');
const adviceTitle = document.querySelector('#adviceTitle');
const travelTipsTitle = document.querySelector('#travelTipsTitle');
const outfitTitle = document.querySelector('#outfitTitle');
const forecastTitle = document.querySelector('#forecastTitle');
const chartPlaceholder = document.querySelector('#chartPlaceholder');

const API_KEY = 'fd72874b6558e7cd6d3cca0ca92a876b';
const CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const AIR_URL     = 'https://api.openweathermap.org/data/2.5/air_pollution';

let isCelsius = true;
let lastCurrent = null;
let lastForecast = null;
let currentLang = 'ko';

// ===== I18N 텍스트 =====
const UI_I18N = {
  ko: {
    appTitle: '나만의 날씨 예보 ☁️',
    placeholder: '도시 이름을 입력하세요',
    search: '검색',
    myloc: '📍 내 위치로 보기',
    unitC: '🌡️ 섭씨 (°C)', unitF: '🌡️ 화씨 (°F)',
    recent: '최근 검색',
    tipsAndOutfit: '여행지 팁 & 오늘의 복장',
    travelTips: '여행지 팁',
    outfit: '복장 추천',
    chartPh: '시간별 온도 변화',
    forecast: '3일 예보',
    hum: '습도', wind: '풍속', aqi: '공기질',
    catIdle: '냐하~ 도시를 검색하면 내가 귀엽게 알려줄게냥!',
    catDone: (name)=>`야옹! ${name}의 날씨를 예쁘게 보여줬다냥!`,
    aqiLevel: ['좋음','보통','약간 나쁨','나쁨','매우 나쁨']
  },
  en: {
    appTitle: 'My Weather Forecast ☁️',
    placeholder: 'Type a city name',
    search: 'Search',
    myloc: '📍 Use my location',
    unitC: '🌡️ Celsius (°C)', unitF: '🌡️ Fahrenheit (°F)',
    recent: 'Recent Searches',
    tipsAndOutfit: 'Travel Tips & Outfit',
    travelTips: 'Travel Tips',
    outfit: 'Outfit',
    chartPh: 'Hourly Temperature',
    forecast: '3-Day Forecast',
    hum: 'Humidity', wind: 'Wind', aqi: 'Air Quality',
    catIdle: 'Meow~ Search a city and I will help you cutely!',
    catDone: (name)=>`Meow! Showing you the weather in ${name}!`,
    aqiLevel: ['Good','Fair','Moderate','Poor','Very Poor']
  },
  ja: {
    appTitle: 'わたしの天気予報 ☁️',
    placeholder: '都市名を入力してください',
    search: '検索',
    myloc: '📍 現在地で見る',
    unitC: '🌡️ 摂氏 (°C)', unitF: '🌡️ 華氏 (°F)',
    recent: '最近の検索',
    tipsAndOutfit: '旅行ヒント＆コーデ',
    travelTips: '旅行ヒント',
    outfit: 'コーデ',
    chartPh: '時間別の気温',
    forecast: '3日間予報',
    hum: '湿度', wind: '風速', aqi: '空気質',
    catIdle: 'にゃーん♪ 都市を検索してね、かわいくお手伝いするにゃ！',
    catDone: (name)=>`${name}の天気をかわいく表示したにゃ！`,
    aqiLevel: ['良い','まあまあ','やや悪い','悪い','非常に悪い']
  }
};

// ===== 이벤트 =====
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });
unitBtn.addEventListener('click', toggleUnit);
locationBtn.addEventListener('click', getWeatherByLocation);
langSelect.addEventListener('change', () => {
  currentLang = langSelect.value;
  applyLangTexts();
  if (lastCurrent && lastForecast) {
    // 언어 바뀌면 API의 lang 파라미터를 적용하기 위해 다시 조회
    pullWeatherByCity(lastCurrent.name);
  } else {
    // 초기 자리표시 텍스트만 변경
    drawTempChart(null, document.body.classList.contains('night'), currentLang);
  }
});

// ===== 언어 적용 (UI 라벨 & placeholder) =====
function applyLangTexts() {
  const L = UI_I18N[currentLang] || UI_I18N.ko;
  appTitle.textContent = L.appTitle;
  cityInput.placeholder = L.placeholder;
  searchBtn.textContent = L.search;
  locationBtn.textContent = L.myloc;
  unitBtn.textContent = isCelsius ? L.unitC : L.unitF;

  recentTitle.textContent = L.recent;
  adviceTitle.textContent = L.tipsAndOutfit;
  travelTipsTitle.textContent = L.travelTips;
  outfitTitle.textContent = L.outfit;
  forecastTitle.textContent = L.forecast;
  chartPlaceholder.textContent = L.chartPh;

  // 고양이 기본 멘트
  catMessage.textContent = L.catIdle;

  // 최근 검색 버튼 텍스트는 도시명 자체이므로 그대로
  renderRecentList();
}

// ===== 검색 =====
async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) { alert(currentLang==='en'?'Please type a city.':currentLang==='ja'?'都市名を入力してください。':'도시 이름을 입력하세요!'); return; }
  await pullWeatherByCity(city);
  saveRecentCity(city);
}

async function pullWeatherByCity(city) {
  const langParam = currentLang === 'ko' ? 'kr' : currentLang; // OWM 언어 코드
  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(`${CURRENT_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${langParam}`),
      fetch(`${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=${langParam}`)
    ]);
    if (!curRes.ok || !fcRes.ok) throw new Error();
    const currentData = await curRes.json();
    const forecastData = await fcRes.json();
    lastCurrent = currentData; lastForecast = forecastData;

    renderCurrent(currentData);
    renderForecast(forecastData);

    // 여행 팁/복장 (다국어)
    const tempC = Math.round(currentData.main.temp);
    const main = (currentData.weather[0].main || '').toLowerCase();
    travelTipsEl.textContent = window.Advice.travelTipsFor(currentData.name, main, currentLang);
    outfitAdviceEl.textContent = window.Advice.outfitFor(tempC, main, currentLang);

    // 차트 라벨도 다국어
    drawTempChart(forecastData, currentData.weather[0].icon.includes('n'), currentLang);

    // 고양이 멘트
    const L = UI_I18N[currentLang] || UI_I18N.ko;
    catMessage.textContent = L.catDone(currentData.name);
  } catch {
    alert(currentLang==='en'?'Could not find that city.':currentLang==='ja'?'都市が見つかりません。':'도시 이름을 다시 확인해 주세요.');
  }
}

// ===== 현재 날씨 표시 =====
function renderCurrent(data) {
  const L = UI_I18N[currentLang] || UI_I18N.ko;

  const tempC = Math.round(data.main.temp);
  const tempF = Math.round((tempC*9)/5 + 32);
  cityName.textContent = data.name || '';
  temperature.textContent = isCelsius ? `${tempC}°C` : `${tempF}°F`;
  description.textContent = fixKoreanDesc(data.weather[0].description || '');

  humidity.textContent = `${L.hum}: ${data.main.humidity}%`;
  wind.textContent = `${L.wind}: ${data.wind.speed}m/s`;

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.style.display = 'block';

  updateBackground(data.weather[0].icon);

  // 공기질
  getAirQuality(data.coord.lat, data.coord.lon);
}

// 한국어 번역 보정(다른 언어는 API 그대로 사용)
function fixKoreanDesc(desc) {
  if (currentLang !== 'ko') return desc;
  const map = {
    '온흐림':'흐림','약간의 구름':'조금 구름','실 비':'가벼운 비',
    '박무':'안개','튼 구름':'구름 많음','구름조금':'조금 구름','연무':'흐림'
  };
  return map[desc] || desc;
}

// ===== 3일 예보 =====
function renderForecast(data) {
  const daily = {};
  (data.list || []).forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  const dates = Object.keys(daily).slice(1, 4);
  forecastCards.innerHTML = '';

  if (!dates.length) {
    // 기본 3카드 유지
    for (let i=0;i<3;i++){
      const c = document.createElement('div');
      c.className = 'card empty';
      c.innerHTML = `<p>—</p><img style="opacity:.2" src="https://openweathermap.org/img/wn/02d.png" alt=""><p>—</p>`;
      forecastCards.appendChild(c);
    }
    return;
  }

  dates.forEach(date => {
    const list = daily[date];
    const temps = list.map(d => d.main.temp);
    const maxT = Math.round(Math.max(...temps));
    const minT = Math.round(Math.min(...temps));
    const noon  = list.find(d => d.dt_txt.includes('12:00')) || list[0];
    const icon  = noon.weather[0].icon;
    const dayName = new Date(date).toLocaleDateString(currentLang==='ja'?'ja-JP':currentLang==='en'?'en-US':'ko-KR', { weekday:'short' });

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <p>${dayName}</p>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="">
      <p>${maxT}°C / ${minT}°C</p>`;
    forecastCards.appendChild(card);
  });
}

// ===== 공기질 =====
async function getAirQuality(lat, lon){
  const L = UI_I18N[currentLang] || UI_I18N.ko;
  try{
    const res = await fetch(`${AIR_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    if(!res.ok) throw 0;
    const data = await res.json();
    const aqi = data.list[0].main.aqi; // 1~5
    const level = (L.aqiLevel[aqi-1]) || L.aqiLevel[1];
    airQuality.textContent = `${L.aqi}: ${level}`;
  }catch{ airQuality.textContent = ''; }
}

// ===== 단위 전환 (현재만 갱신) =====
function toggleUnit(){
  if(!lastCurrent) return;
  isCelsius = !isCelsius;
  const L = UI_I18N[currentLang] || UI_I18N.ko;
  unitBtn.textContent = isCelsius ? L.unitC : L.unitF;
  renderCurrent(lastCurrent);
}

// ===== 위치 =====
function getWeatherByLocation(){
  const L = UI_I18N[currentLang] || UI_I18N.ko;
  if(!navigator.geolocation) return alert(currentLang==='en'?'Geolocation not supported.':currentLang==='ja'?'位置情報が使えません。':'위치 정보를 지원하지 않습니다.');
  locationBtn.textContent = L.myloc + '…';
  const langParam = currentLang === 'ko' ? 'kr' : currentLang;

  navigator.geolocation.getCurrentPosition(async pos=>{
    const { latitude:lat, longitude:lon } = pos.coords;
    try{
      const [curRes, fcRes] = await Promise.all([
        fetch(`${CURRENT_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${langParam}`),
        fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=${langParam}`)
      ]);
      const current = await curRes.json();
      const forecast = await fcRes.json();
      lastCurrent = current; lastForecast = forecast;

      renderCurrent(current);
      renderForecast(forecast);

      const t = Math.round(current.main.temp);
      const main = (current.weather[0].main||'').toLowerCase();
      travelTipsEl.textContent = window.Advice.travelTipsFor(current.name, main, currentLang);
      outfitAdviceEl.textContent = window.Advice.outfitFor(t, main, currentLang);

      drawTempChart(forecast, current.weather[0].icon.includes('n'), currentLang);
      saveRecentCity(current.name);
      catMessage.textContent = L.catDone(current.name);
    }catch(e){
      alert(currentLang==='en'?'Failed to fetch location weather.':currentLang==='ja'?'現在地の天気を取得できませんでした。':'위치 기반 날씨를 가져오지 못했습니다.');
    } finally {
      locationBtn.textContent = L.myloc;
    }
  });
}

// ===== 최근 검색 =====
function saveRecentCity(city){
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if(cities.length>6) cities.pop();
  localStorage.setItem('recentCities', JSON.stringify(cities));
  renderRecentList();
}
function renderRecentList(){
  const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if(!cities.length){ recentSection.style.display='none'; return; }
  recentSection.style.display='block';
  recentList.innerHTML='';
  cities.forEach(c=>{
    const b=document.createElement('button');
    b.textContent=c;
    b.onclick=()=>pullWeatherByCity(c);
    recentList.appendChild(b);
  });
}

// ===== 배경/버튼 & 차트 재도색 =====
function updateBackground(iconCode){
  const isNight = iconCode.includes('n');
  document.body.classList.toggle('night', isNight);
  // 단위 버튼 색
  unitBtn.style.backgroundColor = isNight ? '#555' : '#ff9800';
  unitBtn.style.color = isNight ? '#eee' : '#fff';
  // 차트 라벨/색 다시 적용
  if(lastForecast) drawTempChart(lastForecast, isNight, currentLang);
}

// 초기 언어 적용
window.addEventListener('load', () => {
  currentLang = (langSelect.value || 'ko');
  applyLangTexts();
  renderRecentList();
  // 초기 차트 placeholder(라벨 다국어 반영)
  drawTempChart(null, false, currentLang);
});
