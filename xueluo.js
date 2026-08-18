// [source-name]: 雪落影视
// [source-type]: HTML Scraping (精简美化与原生播放嗅探版)

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
  return jsonify({
    ver: 1,
    title: '雪落影视',
    site: SITE,
    tabs: [
      { name: '全部', ext: { id: '/s/all?type=0' }, ui: 1 },
      { name: '电影', ext: { id: '/s/all?type=1' }, ui: 1 },
      { name: '剧集', ext: { id: '/s/all?type=2' }, ui: 1 },
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
    const url = `${SITE}${id}${id.includes('?') ? '&' : '?'}page=${page}`; 
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    $('.movie-card, .item, .vod-item, .card').each((i, el) => {
      const $el = $(el);
      const $a = $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $el.find('.title, .name, h3, h4').text().trim() || $a.attr('title') || '';
      
      const $img = $el.find('img');
      let vodPic = $img.attr('data-src') || $img.attr('data-original') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      const vodRemarks = $el.find('.remarks, .pic-text, .note, .badge, .card-info').text().replace(/\s+/g, ' ').trim() || '';

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
    
    const tracks = [];
    $('a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const name = $el.text().trim();
      if (href.includes('/play/') && name && !name.includes('首页') && !name.includes('更多')) {
        if (!tracks.some(t => t.ext.url === href)) {
          tracks.push({
            name: name,
            ext: { url: href }
          });
        }
      }
    });
    
    if (tracks.length > 0) {
      list.push({
        title: '在线播放',
        tracks: tracks
      });
    }
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
    
    // 核心大招：直接将播放页整体交给客户端内核去加载并嗅探视频
    // 这样客户端自带的广告拦截和 m3u8 自动嗅探器会直接接管页面，完美跳过前端防刷和广告
    return jsonify({
      parse: 1,
      url: playUrl,
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' }
    });

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
    const url = `${SITE}/s/all?keyword=${encodeURIComponent(keyword)}`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    $('.movie-card, .item, .vod-item, .card').each((i, el) => {
      const $el = $(el);
      const $a = $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $el.find('.title, .name, h3, h4').text().trim() || $a.attr('title') || '';
      
      const $img = $el.find('img');
      let vodPic = $img.attr('data-src') || $img.attr('data-original') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      const vodRemarks = $el.find('.remarks, .pic-text, .note, .badge').text().trim() || '';

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
