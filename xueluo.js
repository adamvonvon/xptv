// [source-name]: 雪落影视
// [source-type]: HTML Scraping (定制主题精准修复版)

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
    
    // 适配雪落影视的卡片选择器
    $('.movie-card, .item, .vod-item, .card').each((i, el) => {
      const $el = $(el);
      
      const $a = $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $el.find('.title, .name, h3, h4').text().trim() || $a.attr('title') || '';
      
      // 提取图片：优先获取 data-src、data-original 或 src
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
    // 匹配详情页中的选集列表链接
    $('a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const name = $el.text().trim();
      // 筛选播放链接（通常包含 /play/）
      if (href.includes('/play/') && name) {
        tracks.push({
          name: name,
          ext: { url: href }
        });
      }
    });
    
    if (tracks.length > 0) {
      list.push({
        title: '默认线路',
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
    
    const { data } = await $fetch.get(playUrl, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);

    // 1. 尝试从页面中的 video 标签或者源码中直接匹配 m3u8 / mp4 链接
    const m3u8Match = data.match(/https?:\/\/[^\s"'<>]+?\.m3u8[^\s"'<>]*/i) || data.match(/https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
    if (m3u8Match) {
      return jsonify({
        urls: [m3u8Match[0]],
        headers: [{ 'User-Agent': UA, 'Referer': playUrl }]
      });
    }

    // 2. 尝试提取 iframe 嵌套播放地址
    const iframeSrc = $('iframe').attr('src');
    if (iframeSrc) {
      let realIframe = iframeSrc;
      if (realIframe.startsWith('//')) realIframe = 'https:' + realIframe;
      else if (realIframe.startsWith('/')) realIframe = SITE + realIframe;
      
      return jsonify({
        parse: 1, // 存在嵌套需要XPTV自带解析
        urls: [realIframe],
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
