// [source-name]: 雪落影视
// [source-type]: HTML Scraping (MacCMS 通用前端解析)

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
      // 使用 MacCMS 默认的分类路径作为 id
      { name: '电影', ext: { id: '/vodtype/1' }, ui: 1 },
      { name: '连续剧', ext: { id: '/vodtype/2' }, ui: 1 },
      { name: '综艺', ext: { id: '/vodtype/3' }, ui: 1 },
      { name: '动漫', ext: { id: '/vodtype/4' }, ui: 1 }
    ]
  });
}

async function getCards(ext) {
  ext = argsify(ext);
  const { id, page = 1 } = ext;
  const list = [];
  
  try {
    // 构造 MacCMS 标准的分页 URL
    const url = `${SITE}${id}-${page}.html`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    // 兼容多种 MacCMS 主流主题的卡片选择器
    const items = $('.module-item, .stui-vodlist__box, .myui-vodlist__box, .public-list-box, .pack-packcover, .v-item');
    
    items.each((i, el) => {
      const $el = $(el);
      // 提取链接和标题
      const $a = $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $a.attr('title') || $el.find('.title, .module-item-title').text().trim() || '';
      
      // 提取图片（兼容原生 src 以及各种 Lazy Load 属性）
      const $img = $el.find('img').first();
      let vodPic = $img.attr('data-original') || $img.attr('data-src') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      // 提取更新集数或备注
      const vodRemarks = $el.find('.module-item-text, .pic-text, .remarks, .pack-prb').first().text().trim() || '';

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
    
    // 提取播放线路名称 (Tab)
    const sources = [];
    $('.module-tab-item, .nav-tabs li, .stui-pannel__head h3').each((i, el) => {
      sources.push($(el).text().trim().replace(/ /g, '') || `线路${i + 1}`);
    });
    
    // 提取对应线路的集数列表
    $('.module-play-list, .stui-content__playlist, .myui-content__list').each((i, el) => {
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
    
    // 尝试直接提取页面中嵌入的 MacCMS 播放器变量[span_1](start_span)[span_1](end_span)
    const playerMatch = data.match(/var\s+player_aaaa\s*=\s*(\{[^<]+?\})\s*;?/);
    if (playerMatch) {
      const playerInfo = JSON.parse(playerMatch[1]);
      let realUrl = playerInfo.url || playerInfo.vid || '';
      
      // 检查是否是被加密的链接 (MacCMS 常用的简单加密)
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
    const url = `${SITE}/vodsearch/${encodeURIComponent(keyword)}----------${page}---.html`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const cheerio = createCheerio();
    const $ = cheerio.load(data);
    
    // 兼容搜索结果页面的不同卡片结构[span_2](start_span)[span_2](end_span)
    const items = $('.module-search-item, .stui-vodlist__media li, .myui-vodlist__media li, .module-item');
    
    items.each((i, el) => {
      const $el = $(el);
      const $a = $el.find('a').first();
      const vodUrl = $a.attr('href') || '';
      const vodName = $a.attr('title') || $el.find('.title, .module-item-title').text().trim() || $el.find('h3').text().trim() || '';
      
      const $img = $el.find('img').first();
      let vodPic = $img.attr('data-original') || $img.attr('data-src') || $img.attr('src') || '';
      if (vodPic && vodPic.startsWith('//')) vodPic = 'https:' + vodPic;
      else if (vodPic && vodPic.startsWith('/')) vodPic = SITE + vodPic;
      
      const vodRemarks = $el.find('.video-info, .pic-text, .remarks').text().trim() || '';

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
