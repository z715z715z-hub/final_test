// 전역 chart 객체 하나만 유지
let tempChartInstance = null;

// 다국어 라벨
const CHART_LABEL = {
  ko: '기온 (°C)',
  en: 'Temperature (°C)',
  ja: '気温 (°C)'
};

// 데이터로 차트 그리기
function drawTempChart(forecastData, isNight, lang='ko') {
  const canvas = document.getElementById('tempChart');
  const placeholder = document.getElementById('chartPlaceholder');
  if (!canvas) return;

  const list = (forecastData && forecastData.list) ? forecastData.list.slice(0, 8) : [];
  if (!list.length) {
    placeholder.style.display = 'flex';
    if (tempChartInstance) { tempChartInstance.destroy(); tempChartInstance = null; }
    return;
  }
  placeholder.style.display = 'none';

  const labels = list.map(i => i.dt_txt.split(' ')[1].slice(0, 5));
  const temps  = list.map(i => Math.round(i.main.temp));

  if (tempChartInstance instanceof Chart) {
    tempChartInstance.destroy();
    tempChartInstance = null;
  }

  const ctx = canvas.getContext('2d');
  canvas.height = 150; // 높이 고정

  tempChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: CHART_LABEL[lang] || CHART_LABEL.ko,
        data: temps,
        borderColor: '#ffb000',
        backgroundColor: 'rgba(255,176,0,0.25)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#ffb000',
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        y: {
          ticks: { color: isNight ? '#eee' : '#333' },
          grid:  { color: isNight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }
        },
        x: {
          ticks: { color: isNight ? '#eee' : '#333' },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { labels: { color: isNight ? '#fff' : '#333' } },
        tooltip: { intersect:false, mode:'index' }
      }
    }
  });
}
