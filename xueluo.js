// 雪落影视 XPTV JS 扩展
// 适用网站：https://v.xl01.cc.ua

const siteUrl = 'https://v.xl01.cc.ua';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36';

// 基础网络请求封装
async function request(url) {
    try {
        let res = await req(url, {
            headers: { 'User-Agent': UA }
        });
        return res.content || "";
    } catch (e) {
        return "";
    }
}

// 1. 初始化
async function init(ext) {
    console.log("雪落影视 扩展已加载");
}

// 2. 获取首页分类
async function home(filter) {
    // 针对该站写死的常用分类，加快加载速度
    let classes = [
        { type_id: '1', type_name: '电影' },
        { type_id: '2', type_name: '剧集' },
        { type_id: '3', type_name: '综艺' },
        { type_id: '4', type_name: '动漫' },
        { type_id: '25', type_name: '纪录' },
        { type_id: '36', type_name: '短剧' }
    ];
    return JSON.stringify({ class: classes });
}

// 3. 获取首页推荐视频 (可选)
async function homeVod() {
    return JSON.stringify({ list: [] }); // 为了性能，暂时返回空，XPTV 会直接进入分类
}

// 4. 获取分类列表
async function category(tid, pg, filter, extend) {
    // MacCMS 标准分类页 URL 结构
    let url = `${siteUrl}/index.php/vod/show/id/${tid}/page/${pg}.html`;
    let html = await request(url);
    
    let list = [];
    // 正则提取：匹配 MacCMS 常见的 module-item 列表
    // 提取 图片链接、标题、副标题、详情页链接
    let regex = /<a[^>]+href="([^"]+)"[^>]+title="([^"]+)"[\s\S]*?data-src="([^"]+)"[\s\S]*?class="module-item-text">([^<]+)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        list.push({
            vod_id: match[1].replace(/.*\/id\/(\d+).*/, '$1'), // 尝试提取纯数字 ID 或直接传路径
            vod_name: match[2],
            vod_pic: match[3].startsWith('http') ? match[3] : siteUrl + match[3],
            vod_remarks: match[4].trim()
        });
    }

    return JSON.stringify({
        page: parseInt(pg),
        pagecount: 99, 
        limit: list.length,
        total: 999,
        list: list
    });
}

// 5. 获取视频详情与播放线路
async function detail(id) {
    // 处理传入的 ID (可能是纯数字，也可能是完整路径)
    let url = id.includes('.html') ? `${siteUrl}${id}` : `${siteUrl}/index.php/vod/detail/id/${id}.html`;
    let html = await request(url);
    
    let vod = {
        vod_id: id,
        vod_name: "",
        vod_pic: "",
        vod_content: "",
        vod_play_from: "",
        vod_play_url: ""
    };

    // 提取标题、简介
    let titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (titleMatch) vod.vod_name = titleMatch[1];
    
    let contentMatch = html.match(/name="description" content="([^"]+)"/);
    if (contentMatch) vod.vod_content = contentMatch[1];

    // 提取播放线路名称 (如: 线路一, 线路二)
    let fromRegex = /<div class="module-tab-item[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g;
    let fromMatch;
    let froms = [];
    while ((fromMatch = fromRegex.exec(html)) !== null) {
        froms.push(fromMatch[1].trim());
    }

    // 提取每一条线路下的集数列表
    // 以 module-play-list 划分块
    let listRegex = /<div class="module-play-list-content[\s\S]*?<\/div>/g;
    let listMatch;
    let urls = [];
    
    while ((listMatch = listRegex.exec(html)) !== null) {
        let blockHtml = listMatch[0];
        let epRegex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
        let epMatch;
        let epList = [];
        
        while ((epMatch = epRegex.exec(blockHtml)) !== null) {
            let epUrl = epMatch[1];
            let epName = epMatch[2].trim();
            epList.push(`${epName}$${epUrl}`);
        }
        urls.push(epList.join("#"));
    }

    vod.vod_play_from = froms.join("$$$");
    vod.vod_play_url = urls.join("$$$");

    return JSON.stringify({ list: [vod] });
}

// 6. 获取真实播放链接
async function play(flag, id, flags) {
    // 此时的 id 是 /index.php/vod/play/id/xxx.html
    let url = siteUrl + id;
    let html = await request(url);
    
    // MacCMS 播放页通常在 JS 中包含 player_aaaa={...} 或 mac_url= 
    let playUrl = "";
    
    // 方案A：解析 player_aaaa 里的 JSON
    let playerMatch = html.match(/player_aaaa=({.+?})</);
    if (playerMatch) {
        try {
            let playerObj = JSON.parse(playerMatch[1]);
            playUrl = playerObj.url;
        } catch(e) {}
    }

    // 方案B：有的直接写在网页 iframe 里
    if (!playUrl) {
        let iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
        if (iframeMatch) {
            playUrl = iframeMatch[1];
        }
    }

    return JSON.stringify({
        parse: 0, // 如果取到的是 m3u8 直接传 0；如果是解析接口传 1
        url: playUrl,
        header: { 'User-Agent': UA }
    });
}

// 7. 搜索功能
async function search(wd, quick, pg) {
    let url = `${siteUrl}/index.php/vod/search/page/${pg || 1}/wd/${encodeURIComponent(wd)}.html`;
    let html = await request(url);
    
    let list = [];
    let regex = /<a[^>]+href="([^"]+)"[^>]+title="([^"]+)"[\s\S]*?data-src="([^"]+)"[\s\S]*?class="module-item-text">([^<]+)/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        list.push({
            vod_id: match[1],
            vod_name: match[2],
            vod_pic: match[3].startsWith('http') ? match[3] : siteUrl + match[3],
            vod_remarks: match[4].trim()
        });
    }

    return JSON.stringify({ list: list });
}

// 导出 XPTV 所需的函数模块
export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search
    };
}
