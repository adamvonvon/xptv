// [source-name]: 雪落影视
// [source-type]: HTML Scraping (横屏海报与播放修复版)

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
      { name: '全部', ext: { id: '/s/all?type=0' }, ui: 2 }, // ui:2 适配横屏/矩形海报卡片
      { name: '电影', ext: { id: '/s/all?type=1' }, ui: 2 },
      { name: '剧集', ext: { id: '/s/all?type=2' }, ui: 2 },
      { name: '综艺', ext: { id: '/s/all?type=3' }, ui: 2 },
      { name: '动漫', ext: { id: '/s/all?type=4' }, ui: 2 }
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
    
    // 提取播放线路名称
    const sourceNames = [];
    $('.tab-item, .play-from li, .source-item, h3').each((i, el) => {
      const txt = $(el).text().trim();
      if (txt) sourceNames.push(txt);
    });

    const tracks = [];
    // 精准匹配所有包含 /play/ 的选集地址
    $('a').each((i, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const name = $el.text().trim();
      if (href.includes('/play/') && name && !name.includes('首页') && !name.includes('更多')) {
        // 去重防重复添加
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
    
    const { data } = await $fetch.get(playUrl, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);

    // 1. 尝试直接从页面脚本中提取播放直链 (m3u8 / mp4)
    const m3u8Match = data.match(/https?:\/\/[^\s"'<>]+?\.m3u8[^\s"'<>]*/i) || data.match(/https?:\/\/[^\s"'<>]+?\.mp4[^\s"'<>]*/i);
    if (m3u8Match) {
      let directUrl = m3u8Match[0].replace(/\\/g, '');
      return jsonify({
        urls: [directUrl],
        headers: [{ 'User-Agent': UA, 'Referer': playUrl }]
      });
    }

    // 2. 尝试从 iframe 或播放器容器中提取嵌套地址
    const iframeSrc = $('iframe').attr('src');
    if (iframeSrc) {
      let realIframe = iframeSrc;
      if (realIframe.startsWith('//')) realIframe = 'https:' + realIframe;
      else if (realIframe.startsWith('/')) realIframe = SITE + realIframe;
      
      return jsonify({
        parse: 1, // 启用内置解析器
        url: realIframe,
        headers: { 'User-Agent': UA, 'Referer': playUrl }
      });
    }

    // 3. 兜底：如果页面内含有 ckplayer / dplayer 等配置的 json 链接
    const urlMatch = data.match(/["'](https?:\/\/[^"'\s]+?\.(m3u8|mp4)[^"'\s]*)["']/i);
    if (urlMatch) {
      return jsonify({
        urls: [urlMatch[1]],
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
    const { data } = varData = await $fetch.get(url, { 
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
