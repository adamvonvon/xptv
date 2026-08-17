// [source-name]: XL01影视
// [source-type]: MacCMS JSON API

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const SITE = 'https://v.xl01.cc.ua';
// 强制使用 JSON 格式的接口路径，避免默认返回 XML 导致解析失败
const API = `${SITE}/api.php/provide/vod/at/json/`;

// 1. 识别源信息
async function getLocalInfo() {
  return jsonify({
    ver: 1,
    name: 'XL01影视',
    api: 'csp_xl01',
    type: 3
  });
}

// 2. 定义首页标签 (Tabs)
async function getConfig() {
  return jsonify({
    ver: 1,
    title: 'XL01影视',
    site: SITE,
    tabs: [
      { name: '电影', ext: { id: '1' }, ui: 1 },
      { name: '连续剧', ext: { id: '2' }, ui: 1 },
      { name: '综艺', ext: { id: '3' }, ui: 1 },
      { name: '动漫', ext: { id: '4' }, ui: 1 }
    ]
  });
}

// 3. 获取分类影片列表
async function getCards(ext) {
  ext = argsify(ext);
  const { id, page = 1 } = ext;
  const list = [];
  
  try {
    const url = `${API}?ac=detail&t=${id}&pg=${page}`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const json = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (json.list && Array.isArray(json.list)) {
      json.list.forEach(item => {
        list.push({
          vod_id: item.vod_id.toString(),
          vod_name: item.vod_name,
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks || '',
          ext: { id: item.vod_id.toString() } // 将 ID 传递给 getTracks
        });
      });
    }
  } catch (e) {
    console.error('getCards error:', e);
  }
  
  return jsonify({ list, page });
}

// 4. 获取影片播放线路与集数
async function getTracks(ext) {
  ext = argsify(ext);
  const { id } = ext;
  const list = [];
  
  try {
    const url = `${API}?ac=detail&ids=${id}`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const json = typeof data === 'string' ? JSON.parse(data) : data;
    const item = json.list && json.list[0];
    
    if (item && item.vod_play_from && item.vod_play_url) {
      // MacCMS 数据格式: 多线路用 $$$ 分隔
      const playFroms = item.vod_play_from.split('$$$');
      const playUrls = item.vod_play_url.split('$$$');
      
      for (let i = 0; i < playFroms.length; i++) {
        const fromName = playFroms[i];
        const urlsString = playUrls[i];
        if (!urlsString) continue;
        
        // 单一线路内的集数用 # 分隔，集数名称与链接用 $ 分隔
        const tracks = [];
        urlsString.split('#').forEach(ep => {
          const parts = ep.split('$');
          if (parts.length >= 2) {
            tracks.push({
              name: parts[0],
              ext: { url: parts[1] } // 将播放 URL 传递给 getPlayinfo
            });
          }
        });
        
        if (tracks.length > 0) {
          list.push({
            title: fromName,
            tracks: tracks
          });
        }
      }
    }
  } catch (e) {
    console.error('getTracks error:', e);
  }
  
  return jsonify({ list });
}

// 5. 解析真实播放地址
async function getPlayinfo(ext) {
  try {
    ext = argsify(ext);
    const { url } = ext;
    
    return jsonify({
      urls: url ? [url] : [],
      headers: [{ 
        'User-Agent': UA, 
        'Referer': SITE + '/' 
      }]
    });
  } catch (error) {
    console.error('getPlayinfo error:', error);
    return jsonify({ urls: [] });
  }
}

// 6. 搜索功能
async function search(ext) {
  ext = argsify(ext);
  const { text, wd, page = 1 } = ext;
  const keyword = text || wd || '';
  const list = [];
  
  if (!keyword) return jsonify({ list, page });
  
  try {
    const url = `${API}?ac=detail&wd=${encodeURIComponent(keyword)}&pg=${page}`;
    const { data } = await $fetch.get(url, { 
      headers: { 'User-Agent': UA, 'Referer': SITE + '/' } 
    });
    
    const json = typeof data === 'string' ? JSON.parse(data) : data;
    
    if (json.list && Array.isArray(json.list)) {
      json.list.forEach(item => {
        list.push({
          vod_id: item.vod_id.toString(),
          vod_name: item.vod_name,
          vod_pic: item.vod_pic || '',
          vod_remarks: item.vod_remarks || '',
          ext: { id: item.vod_id.toString() }
        });
      });
    }
  } catch (e) {
    console.error('search error:', e);
  }
  
  return jsonify({ list, page });
}
