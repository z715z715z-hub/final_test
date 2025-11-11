// 간단한 규칙 기반 추천 (오프라인 동작, 다국어 지원)
// window.Advice.outfitFor(tempC, weatherMain, lang)
// window.Advice.travelTipsFor(city, weatherMain, lang)
(function () {
  const I18N = {
    ko: {
      hot: '매우 더워요! 반팔/반바지, 모자, 선크림 추천',
      warm: '덥습니다. 얇은 셔츠/반팔, 통풍 좋은 옷',
      mild: '선선해요. 가벼운 긴팔/가디건',
      cool: '쌀쌀합니다. 자켓/얇은 코트',
      cold: '춥습니다. 두꺼운 외투/패딩, 목도리',
      rain: ' • 우산/방수 재킷',
      snow: ' • 미끄럼 방지 신발',
      defaultTip: '인기 관광지는 미리 예약하면 기다림을 줄일 수 있어요.',
      rainTip: ' 비 예보가 있어 실내 위주 일정을 고려해 보세요.',
      snowTip: ' 눈길에는 대중교통 이동을 추천해요.',
      clearTip: ' 맑은 날엔 공원/전망대 같은 야외 코스를 추천해요.',
      cloudTip: ' 은은한 빛이라 사진 찍기 좋아요. 카페/박물관 코스도 굿!'
    },
    en: {
      hot: 'Very hot! T-shirt/shorts, hat, sunscreen',
      warm: 'Warm. Light shirts/tees, breathable clothes',
      mild: 'Mild. Light long sleeves/cardigan',
      cool: 'Cool. Jacket/light coat',
      cold: 'Cold. Heavy coat/puffer, scarf',
      rain: ' • Bring an umbrella / rain jacket',
      snow: ' • Wear anti-slip shoes',
      defaultTip: 'Reserve popular attractions in advance to avoid long lines.',
      rainTip: ' Rain is expected; consider indoor activities.',
      snowTip: ' Use public transport on snowy days.',
      clearTip: ' Great day for parks/observatories.',
      cloudTip: ' Soft light for photos. Cafés/museums are nice too!'
    },
    ja: {
      hot: 'とても暑いです！半袖/短パン、帽子、日焼け止め',
      warm: '暑いです。薄手のシャツ/半袖、通気性のある服',
      mild: '涼しいです。薄手の長袖/カーディガン',
      cool: '肌寒いです。ジャケット/薄手のコート',
      cold: '寒いです。厚手のコート/ダウン、マフラー',
      rain: ' ・傘/レインジャケットを持っていきましょう',
      snow: ' ・滑りにくい靴をおすすめ',
      defaultTip: '人気スポットは事前予約で待ち時間を短縮できます。',
      rainTip: ' 雨予報なので屋内中心のプランを。',
      snowTip: ' 雪道は公共交通機関の利用がおすすめ。',
      clearTip: ' 晴れの日は公園/展望台など屋外コースが◎',
      cloudTip: ' 柔らかい光で写真日和。カフェ/美術館も良いです。'
    }
  };

  // 도시별 기본 팁(언어별)
  const CITY_TIPS = {
    ko: {
      '서울': '대중교통이 편리해요. 교통카드 준비, 인기 맛집은 예약 추천!',
      'tokyo': 'Suica/PASMO 충전 권장, 지하철 노선 파악해두면 좋아요.',
      'paris': '관광지 소매치기 유의, 미술관은 온라인 예매가 편해요.',
      'new york': '팁 문화(15~20%) 유의. OMNY/메트로카드 사용 편리.'
    },
    en: {
      '서울': 'Transit is convenient; get a T-money card. Book popular restaurants.',
      'tokyo': 'Top up Suica/PASMO; subway maps are complex—review beforehand.',
      'paris': 'Beware of pickpockets. Reserve museums online.',
      'new york': 'Mind tipping (15–20%). OMNY/MetroCard is handy.'
    },
    ja: {
      '서울': '交通が便利。交通カードを用意し、人気店は予約がおすすめ。',
      'tokyo': 'Suica/PASMOのチャージがおすすめ。地下鉄路線を把握しましょう。',
      'paris': 'スリに注意。美術館はオンライン予約が便利。',
      'new york': 'チップ(15–20%)に注意。OMNY/メトロカードが便利。'
    }
  };

  function normalizeCity(city) {
    if (!city) return '';
    const c = city.trim().toLowerCase();
    if (c.includes('seoul') || c.includes('서울')) return '서울';
    if (c.includes('tokyo') || c.includes('도쿄') || c.includes('東京')) return 'tokyo';
    if (c.includes('paris') || c.includes('파리')) return 'paris';
    if (c.includes('new york') || c.includes('뉴욕')) return 'new york';
    return '';
  }

  function outfitFor(tempC, weatherMain, lang='ko') {
    const t = I18N[lang] || I18N.ko;
    let msg;
    if (tempC >= 28) msg = t.hot;
    else if (tempC >= 23) msg = t.warm;
    else if (tempC >= 17) msg = t.mild;
    else if (tempC >= 10) msg = t.cool;
    else msg = t.cold;
    const w = (weatherMain || '').toLowerCase();
    if (w.includes('rain')) msg += t.rain;
    if (w.includes('snow')) msg += t.snow;
    return msg;
  }

  function travelTipsFor(city, weatherMain, lang='ko') {
    const L = I18N[lang] || I18N.ko;
    const baseTips = CITY_TIPS[lang] || CITY_TIPS.ko;
    const key = normalizeCity(city);
    let tip = key ? baseTips[key] : L.defaultTip;
    const w = (weatherMain || '').toLowerCase();
    if (w.includes('rain')) tip += L.rainTip;
    if (w.includes('snow')) tip += L.snowTip;
    if (w.includes('clear')) tip += L.clearTip;
    if (w.includes('cloud')) tip += L.cloudTip;
    return tip;
  }

  window.Advice = { outfitFor, travelTipsFor };
})();
