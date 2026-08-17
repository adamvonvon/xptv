// [source-name]: 雪落影视
// [source-type]: HTML Scraping (定制主题解析)

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const SITE = 'https://v.xl01.cc.ua';

async function getLocalInfo() {
  return jsonify({
    ver: 1,
    name: '雪落影视',
    api: 'csp_xl01_html',
    type: 3
  });
}

async function getConfig() {
  // 根据截图上的 URL 结构，分类路由是 /s/all?type=X 的形式
  return jsonify({
    ver: 1,
    title: '雪落影视',
    site: SITE,
    tabs: [
      { name: '全部', ext: { id: '/s/all?type=0' }, ui: 1 },
      { name: '电影', ext: { id: '/s/all?type=1' }, ui: 1 }, // 盲猜 type=1 是电影
      { name: '电视剧', ext: { id: '/s/all?type=2' }, ui: 1 }, // 盲猜 type=2 是电视剧
      { name: '综艺', ext: { id: '/s/all?type=3' }, ui: 1 },
      { name: '动漫', ext: { id: '/s/all?type=4' }, ui: 1 }
    ]
  });
}

async function getCards(ext) {
  ext = argsify(ext);
  const { id, page = 1 } = ext;
  const list = [];
  
  try {
    // 构造请求 URL，根据截图的 URL 拼接分页参数
    const url = `${SITE}${id}&page=${page}`; 
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    // 💥 使用从截图中获取的确切 class：movie-card 💥
    $('.movie-card').each((i, el) => {
      const $el = $(el);
      
      const $a = $el.find('a.card-img');
      const vodUrl = $a.attr('href') || '';
      const vodName = $a.attr('title') || '';
      
      // 提取图片（优先拿懒加载的 data-src）
      const $img = $a.find('img.fade-in');
      let vodPic = $img.attr('data-src') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      // 提取更新集数或备注（截图里的 2026-08-02 和评分）
      const vodRemarks = $el.find('.card-info').text().replace(/\s+/g, ' ').trim() || $el.find('.rating-badge').text().trim() || '';

      if (vodUrl && vodName) {
        list.push({
          vod_id: vodUrl,
          vod_name: vodName,
          vod_pic: vodPic,
          vod_remarks: vodRemarks,
          ext: { url: vodUrl } // 把相对路径传给 getTracks
        });
      }
    });
  } catch (e) {
    console.error('getCards error:', e);
  }
  
  return jsonify({ list, page });
}

async function getTracks(ext) {
  ext = argsify(ext);
  const { url } = ext;
  const list = [];
  
  try {
    const detailUrl = url.startsWith('http') ? url : SITE + url;
    const { data } = await $fetch.get(detailUrl, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    // 因为还没看到详情页，所以这里使用“广撒网”策略匹配常见的线路和播放列表
    const sources = [];
    $('.play-source, .nav-tabs li, .stui-pannel__head h3, .xl-play-tab, .play-tab a, .module-tab-item').each((i, el) => {
      sources.push($(el).text().trim().replace(/ /g, '') || `线路${i + 1}`);
    });
    
    $('.play-list, .xl-play-list, .playlist, .stui-content__playlist, .myui-content__list, .module-play-list').each((i, el) => {
      const tracks = [];
      $(el).find('a').each((j, a) => {
        const $a = $(a);
        const epName = $a.text().trim();
        const epUrl = $a.attr('href') || '';
        if (epUrl) {
          tracks.push({
            name: epName,
            ext: { url: epUrl }
          });
        }
      });
      
      if (tracks.length > 0) {
        list.push({
          title: sources[i] || `线路${i + 1}`,
          tracks: tracks
        });
      }
    });
  } catch (e) {
    console.error('getTracks error:', e);
  }
  
  return jsonify({ list });
}

async function getPlayinfo(ext) {
  try {
    ext = argsify(ext);
    const { url } = ext;
    const playUrl = url.startsWith('http') ? url : SITE + url;
    
    const { data } = await $fetch.get(playUrl, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    // 尝试提取常见的 player_aaaa 变量
    const playerMatch = data.match(/var\s+player_aaaa\s*=\s*(\{[^<]+?\})\s*;?/);
    if (playerMatch) {
      const playerInfo = JSON.parse(playerMatch[1]);
      let realUrl = playerInfo.url || playerInfo.vid || '';
      
      if (playerInfo.encrypt == 1) {
        realUrl = decodeURIComponent(realUrl);
      } else if (playerInfo.encrypt == 2) {
        const CryptoJS = createCryptoJS();
        realUrl = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(realUrl));
      }
      
      if (realUrl) {
        return jsonify({
          urls: [realUrl],
          headers: [{ 'User-Agent': UA, 'Referer': playUrl }]
        });
      }
    }
    
    // 兜底方案：尝试提取 iframe
    const iframeMatch = data.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (iframeMatch) {
      let iframeSrc = iframeMatch[1];
      if (iframeSrc.startsWith('/')) iframeSrc = SITE + iframeSrc;
      return jsonify({
        urls: [iframeSrc],
        headers: [{ 'User-Agent': UA, 'Referer': playUrl }]
      });
    }
    
  } catch (error) {
    console.error('getPlayinfo error:', error);
  }
  return jsonify({ urls: [] });
}

async function search(ext) {
  ext = argsify(ext);
  const { text, wd, page = 1 } = ext;
  const keyword = text || wd || '';
  const list = [];
  
  if (!keyword) return jsonify({ list, page });
  
  try {
    // 兼容两套可能的搜索路径
    const url = `${SITE}/vodsearch/${encodeURIComponent(keyword)}----------${page}---.html`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    // 搜索页极有可能复用 movie-card
    $('.movie-card, .module-search-item, .stui-vodlist__media li').each((i, el) => {
      const $el = $(el);
      
      const $a = $el.find('a.card-img').length ? $el.find('a.card-img') : $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $a.attr('title') || $el.find('h3').text().trim() || '';
      
      const $img = $a.find('img');
      let vodPic = $img.attr('data-src') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      const vodRemarks = $el.find('.card-info').text().trim() || '';

      if (vodUrl && vodName) {
        list.push({
          vod_id: vodUrl,
          vod_name: vodName,
          vod_pic: vodPic,
          vod_remarks: vodRemarks,
          ext: { url: vodUrl }
        });
      }
    });
  } catch (e) {
    console.error('search error:', e);
  }
  
  return jsonify({ list, page });
}
