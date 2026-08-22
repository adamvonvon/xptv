 // =================== 基础工具函数 ===================
function jsonify(data) {
    return JSON.stringify(data);
}

function argsify(data) {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

// =================== 集中配置 ===================
const ALIST_KEY = 'alist-09ceb38a-f143-47f7-b255-c3eec819cd7bdhgXvamWCW70sBWrHoNxVwEtTSXBtwXFurHeU7yXTWVKJ_gj7uWSTYt1eRuvPmma';
const CONFIG = {
    UA: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Mobile/15E148 Safari/604.1',

    // 核心服务地址
    SITE: 'http://192.168.100.20:4567',                        // VOD 服务 + 分享链接挂载
    ALIST_SITE: 'http://192.168.100.20:5244',                  // AList 服务
    SEARCH_API_BASE: 'http://192.168.100.20:8800',            // 统一搜索 API
    SERVER_TOKEN: '49b8385b90424618a899b6305a271db5',                        // VOD 服务访问令牌
    TG_DB_URL: 'https://tvbox.example.com/tg-db/YOUR_SERVER_TOKEN', // 豆瓣推荐数据库

    // 性能与限制
    MAX_CONCURRENT_REQUESTS: 20,                  // 最大并发请求数
    MAX_SEARCH_RESULTS: 200,                      // 递归收集视频文件时最大返回数量
    MAX_VALIDATE_RESULTS: 60,                     // 搜索后最多验证多少个候选分享链接
    TARGET_RETURN_RESULTS: 18,                    // 搜索最终返回给用户的最大结果数
    MAX_RECURSION_DEPTH: 2,                       // 目录递归遍历最大深度
    MIN_VIDEO_SIZE: 50 * 1024 * 1024,             // 最小视频文件大小阈值 (50MB)
    MAX_QUARK_BAIDU_RESULTS: 8,                  // 夸克和百度云盘搜索结果每种最多取前N条
    REQUEST_TIMEOUT: 5000,                        // 通用请求超时 (毫秒)
    VALIDATE_TIMEOUT: 5000,                       // 链接验证/内容分析超时 (毫秒)
    SHARE_LINK_TIMEOUT: 5000,                     // 分享链接挂载超时 (毫秒)
    ALIST_LIST_TIMEOUT: 8000,                     // AList 获取目录列表超时 (毫秒)
    MAX_SEARCH_DURATION: 12000,                   // 搜索验证最大耗时 (毫秒)

    // 重试控制
    RETRY_MAX_RETRIES: 2,                         // 请求失败最大重试次数
    RETRY_BASE_DELAY: 3000,                       // 重试基础延迟 (毫秒)

    // 熔断器参数
    CIRCUIT_MAX_ENTRIES: 200,                     // 熔断器最大记录条数
    CIRCUIT_BREAK_COUNT: 3,                       // 连续失败 N 次触发熔断l
    CIRCUIT_BREAK_WINDOW: 60000,                  // 熔断窗口期 (毫秒)
    CIRCUIT_STALE_TIMEOUT: 300000,                // 过期记录清理时间 (毫秒)
    CIRCUIT_RECOVER_COUNT: 3,                     // 连续成功 N 次解除熔断

    // VOD / AList 扫描参数
    VOD_PAGE_SIZE: 150,                           // VOD API 单页文件数
    VOD_MAX_DIRECTORIES: 200,                     // 递归扫描最大目录数
    VOD_VALIDATE_MAX_FILES: 5,                   // 验证阶段每个链接最多分析文件数
    ALIST_ANALYZE_LIMIT: 200,                     // AList 单目录分析最大条目数

    // 标题显示参数
    TITLE_MAX_LENGTH: 80,                         // 清洗后标题最大长度
    TITLE_FALLBACK_LENGTH: 30,                    // 回退标题最大长度
    TRACK_SHORT_NAME_LIMIT: 15,                   // 轨道名短名阈值

    // 豆瓣卡片搜索参数
    TGDB_SEARCH_LIMIT: 40,                        // 豆瓣卡片触发搜索时 API 返回的最大结果数
    TGDB_PAGE_SIZE: 35,                           // 豆瓣卡片每页条数
    TGDB_MAX_LINKS_PER_TYPE: 2,                   // 每种云盘最多选取的分享链接数
    TGDB_RECURSION_MAX_FILES: 150,                // 每个链接递归收集的最大视频文件数

    // 搜索API关键词过滤器
    SEARCH_FILTER: {
        exclude: [
            '电子书', '云盘', 'txt', '热门', '正式', '分享', '文档', '作者', '小说', '短剧',
            '评书', '标题', '绘本', '网盘', '测试', '小程序', '预告', '预感', '盈利', '即可观看',
            '书籍', '图书', '丛书', '期刊', 'app', '软件', '破解版', '解锁', '专业版', '高级版',
            '最新版', '食谱', '免安装', '免广告', 'Android', '课程', '教程', '教学', '全书', '名著',
            'mobi', 'MOBI', 'epub', '任天堂', 'PC', '单机游戏', '小学', '初中', 'pdf', 'PDF', 'PPT',
            '抽奖', '完整版', '有声书', '读者', '文学', '写作', '节课', '套装', '话术', '纯净版',
            '日历', 'MP3', '网赚', 'mp3', 'WAV', 'CD', '音乐', '专辑', '模板', '书中', '作品', '读物',
            '入门', '零基础', '常识', '电商', '小红书', 'JPG', '短视频', '工作总结', '哈哈哈哈哈',
            '写真', '抖音', '资料', '华为', '学习', '付费',
            '数学', '语文', '唐诗', '魔法坏女巫', '车载', 'DJ', '合并', '真人秀',
            'WX', 'QQ', 'V', '联系', '群组', '频道', '补档', '失效', '求删', '可秒播', '网盘资源',
            '秒传', '打包', '收藏', '外挂', '卡片', '《', '金瓶'
        ]
    },
};

// =================== 云盘类型定义 ===================
const VOD_CLOUD_TYPES = new Set(['uc', 'quark', 'baidu']);
const ALIST_CLOUD_TYPES = new Set(['aliyun', 'tianyi', '123', 'mobile']);

const CLOUD_TYPE_MAP = {
    'uc': 'UC', 'quark': '夸克', 'baidu': '百度',
    'aliyun': '阿里', 'tianyi': '天翼', '123': '123', 'mobile': '移动'
};

const DEFAULT_IMAGES = {
    'uc': 'https://tvbox.example.com/uc.png',
    'quark': 'https://tvbox.example.com/quark.png',
    'baidu': 'https://tvbox.example.com/baidu.jpg',
    'aliyun': 'https://tvbox.example.com/ali.jpg',
    'tianyi': 'https://tvbox.example.com/189.png',
    '123': 'https://tvbox.example.com/123.png',
    'mobile': 'https://tvbox.example.com/139.jpg'
};
const FALLBACK_POSTER = 'https://tvbox.example.com/default.png';

const ALL_CLOUD_TYPES = [...VOD_CLOUD_TYPES, ...ALIST_CLOUD_TYPES].join(',');

// 豆瓣卡片搜索结果缓存
const TGDB_CACHE = new Map();
const TGDB_CACHE_MAX_SIZE = 50;
const TGDB_CACHE_TTL = 30 * 60 * 1000;
const TGDB_EMPTY_CACHE_TTL = 3 * 60 * 1000;

function isVodType(cloudType) { return VOD_CLOUD_TYPES.has(cloudType); }
function isAlistType(cloudType) { return ALIST_CLOUD_TYPES.has(cloudType); }

// =================== 媒体文件扩展名 ===================
const MEDIA_EXTS = new Set([
    '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.m4v', '.mpg', '.mpeg',
    '.ts', '.m2ts', '.webm', '.rm', '.rmvb', '.3gp', '.asf', '.divx', '.vob'
]);

// =================== App 配置 ===================
const appConfig = {
    ver: 5.2,
    title: '网盘搜索 - UC/夸克/百度/阿里/天翼/123/移动 (统一版)',
    site: CONFIG.SEARCH_API_BASE,
    tabs: [
        { name: '全部', ext: { id: 'hot_tv' } },
        { name: '热门电影', ext: { id: 'hot_movie' } },
        { name: '热门电视剧', ext: { id: 'hot_tv' } },
        { name: '国产剧', ext: { id: 'tv_domestic' } },
        { name: '欧美剧', ext: { id: 'tv_american' } },
        { name: '动漫', ext: { id: 'tv_animation' } },
        { name: '综艺', ext: { id: 'tv_variety_show' } },
        { name: '韩剧', ext: { id: 'tv_korean' } },
        { name: '日剧', ext: { id: 'tv_japanese' } },
        { name: '电影推荐', ext: { id: 'suggestion_movie' } },
        { name: '电视剧推荐', ext: { id: 'suggestion_tv' } },
        { name: 'Top250', ext: { id: 'movie_top250' } },
        { name: '实时热门电影', ext: { id: 'movie_real_time_hotest' } },
        { name: '一周口碑电影', ext: { id: 'movie_weekly_best' } },
        { name: '实时热门电视', ext: { id: 'tv_real_time_hotest' } },
        { name: '华语口碑剧集', ext: { id: 'tv_chinese_best_weekly' } },
        { name: '全球口碑剧集', ext: { id: 'tv_global_best_weekly' } },
        { name: '国内口碑综艺', ext: { id: 'show_chinese_best_weekly' } },
        { name: '国外口碑综艺', ext: { id: 'show_global_best_weekly' } }
    ],
    resolutions: [
        { key: '4K', patterns: ['4k', '2160p'] },
        { key: '1080P', patterns: ['1080p', '1920x1080'] },
        { key: '720P', patterns: ['720p', '1280x720'] },
        { key: 'Other', patterns: [] }
    ]
};

// =================== 预编译正则表达式 ===================
const NOISE_PARTS = [
    '\\d+fps', '\\d+帧', '\\b4K\\b', '\\b1080P\\b', '\\b720P\\b', '\\b2160P\\b', 'HDR', 'DV', '更新至', '《', '》', '合集', '十部曲', '杜比',
    '大小\\d+[\\.\\s]\\d+GB', '全集', '多版本',
    '高清', '蓝光', '无广告', '无字幕', 'WEB', '演员', '版', '主演', '原盘', '推荐：', '名称：', '集全', '剧集', '韩剧', '资源',
    'REMUX', '内封', '港剧', '字幕', '完结描述', '高码率', '真4K', '臻彩', 'MAX', '美国', '剧情', '国产剧', '美剧',
    'MA版', '杜比视界\\+DV', 'HDR混合特', '✅', '内封简繁', '\\s*\\d{4}[.\\/]\\d{2}[.\\/]\\d{2}', 'CC', 'DL', 'NF', 'HULU', 'AMZN',
    'DISNEY', 'AVC', 'HEVC', 'H\\.265', 'X265', '完整版', '未删减', '国语', '中字', '粤语', '最新', '尝鲜', '剧场版',
    '高码', '更新', '高清无', '60fps', '60帧', '已更新',
    'Remux', 'REMUX', 'BluRay', 'BLURAY', 'BDRip', 'BDRemux', 'BDISO', 'ISO', 'TrueHD', 'Atmos', 'DTS-HD', 'DTSHD', 'Master\\s*Audio',
    'WEB-DL', 'WEBDL', 'WebDL', 'WEBRip', 'WebRip', 'WEBCAP', 'WebCap', 'Netflix', 'Amazon', 'Disney', 'DSNP', 'DSNY', 'HBO',
    'AppleTV', 'APTV', 'iTunes', 'ATVP', 'HDTV', 'PDTV', 'TVRip', 'DSR', 'SATRip', 'DVBRip',
    'HC', 'Hardcoded', 'HardSub', 'SoftSub', 'Subs', 'Subbed', 'DualAudio', 'MultiAudio', 'MultiSubs',
    'x264', 'x265', 'X264', 'X265', 'H264', 'H265', 'HEVC', 'AVC', 'AV1', 'VP9', '10bit', '8bit', 'HDR10', 'HDR10\\+', 'HLG',
    'DolbyVision', 'Director\'?s\\s*Cut', 'Extended', 'Unrated', 'Uncut', 'Final', 'Theatrical', 'Ultimate', 'Criterion',
    'Special\\s*Edition', 'Collector\'?s\\s*Edition', 'ENCODED?', 'Encode', 'Rip', 'Ripped', 'Internal', 'Proper', 'Repack',
    'REPACK', 'LiMiTED', 'Limited', '4KUpscale', 'Upscaled', 'AI\\s*Enhance', 'AI增强', 'Hybrid', 'HybridRemux'
];

const NOISE_WORDS_REGEX = new RegExp('(?:' + NOISE_PARTS.join('|') + ')\\s*[\\.\\-\\|\\s\\·]*', 'gi');
const LIGHT_NOISE_REGEX = new RegExp('(?:' + NOISE_PARTS.slice(0, 50).join('|') + ')\\s*[\\.\\-\\|\\s\\·]*', 'gi');

const REGEX_PATTERNS = {
    htmlTags: /<[^>]*>/g,
    yearPattern: /(.*?)([\(（]\s*\d{4}\s*[\)）])(.*)/,
    brackets: /\[.*?\]|\【.*?\】/g,
    parentheses: /\(.*?\)|\（.*?\）/g,
    angleBrackets: /<.*?>/g,
    episodeTruncate: /\s*(更至|更新至|全)\s*\d+[集季]?.*$/i,
    NoiseWords: NOISE_WORDS_REGEX,
    lightNoiseWords: LIGHT_NOISE_REGEX,
    emoji: /[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u2B55\u200d]/g,
    specialChars: /[#@$%^&*+=`~;:\"'\\|/?<>]/g,
    duplicateWords: /(\b[\u4e00-\u9fa5a-zA-Z0-9]+\b)\s*\1+/g,
    tagExtraction: /(4K|2160P|UHD|1080P|FHD|720P|HD|HDR|杜比|DV|Atmos|DTS|蓝光|BluRay|BD|WEB-DL|原盘|REMUX|杜比视界|HDR10\+|中字|国语|粤语|双语)/gi
};

// =================== Session Headers 工厂函数 ===================
function getSessionHeaders() {
    return {
        'User-Agent': CONFIG.UA,
        'Referer': CONFIG.SEARCH_API_BASE + '/',
        'x-api-key': ALIST_KEY,
        'Content-Type': 'application/json',
        'X-client': 'com.fongmi.android.tv'
    };
}

// =================== 重试控制器 ===================
class RetryController {
    constructor(maxRetries = 2, baseDelay = 1000, maxCircuitEntries = CONFIG.CIRCUIT_MAX_ENTRIES) {
        this.maxRetries = maxRetries;
        this.baseDelay = baseDelay;
        this.maxCircuitEntries = maxCircuitEntries;
        this.circuitBreaker = new Map();
    }

    getDelay(retryCount) {
        return this.baseDelay * Math.pow(2, retryCount) + Math.random() * 100;
    }

    _evictStale() {
        const now = Date.now();
        for (const [url, record] of this.circuitBreaker) {
            if (now - record.lastFailure > CONFIG.CIRCUIT_STALE_TIMEOUT) {
                this.circuitBreaker.delete(url);
            }
        }
    }

    shouldBreak(url) {
        const record = this.circuitBreaker.get(url);
        if (!record) return false;
        const now = Date.now();
        if (record.failures >= CONFIG.CIRCUIT_BREAK_COUNT && now - record.lastFailure < CONFIG.CIRCUIT_BREAK_WINDOW) return true;
        this.circuitBreaker.delete(url);
        return false;
    }

    recordFailure(url) {
        if (this.circuitBreaker.size >= this.maxCircuitEntries) {
            this._evictStale();
        }
        if (this.circuitBreaker.size >= this.maxCircuitEntries) {
            const firstKey = this.circuitBreaker.keys().next().value;
            if (firstKey) this.circuitBreaker.delete(firstKey);
        }
        const record = this.circuitBreaker.get(url) || { failures: 0, lastFailure: 0, successCount: 0 };
        record.failures++;
        record.lastFailure = Date.now();
        this.circuitBreaker.set(url, record);
    }

    recordSuccess(url) {
        const record = this.circuitBreaker.get(url);
        if (record) {
            record.successCount++;
            if (record.successCount >= CONFIG.CIRCUIT_RECOVER_COUNT) {
                this.circuitBreaker.delete(url);
            }
        }
    }

    async withRetry(operation, url) {
        if (this.shouldBreak(url)) throw new Error(`请求已熔断: ${url}`);
        for (let i = 0; i <= this.maxRetries; i++) {
            try {
                const result = await operation();
                this.recordSuccess(url);
                return result;
            } catch (error) {
                if (i === this.maxRetries) { this.recordFailure(url); throw error; }
                if (error.message?.includes('404') || error.message?.includes('无效链接') || error.message?.includes('不支持')) throw error;
                await new Promise(resolve => setTimeout(resolve, this.getDelay(i)));
            }
        }
    }
}

const retryController = new RetryController(CONFIG.RETRY_MAX_RETRIES, CONFIG.RETRY_BASE_DELAY);

// =================== 通用工具函数 ===================
function logError(message, e = null, showToast = true) {
    if (showToast) {
        $utils.toastError(`错误: ${message.substring(0, 30)}...`);
    }
}

async function safeFetch(url, options = {}) {
    return retryController.withRetry(async () => {
        const response = await $fetch.get(url, { timeout: CONFIG.REQUEST_TIMEOUT, ...options });
        if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${url}`);
        return response;
    }, url);
}

async function safePost(url, body, options = {}) {
    return retryController.withRetry(async () => {
        const response = await $fetch.post(url, body, { timeout: CONFIG.REQUEST_TIMEOUT, ...options });
        if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${url}`);
        return response;
    }, url);
}

function safeJsonParse(data) {
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); } catch (e) { return {}; }
}

function safeDecode(str) {
    try { return decodeURIComponent(str); } catch { return str; }
}

function cleanPath(path) {
    return path ? path.replace(/\/+/g, '/').trim() : '';
}

function isLikelyVideoFile(filename, size = 0) {
    if (!filename) return false;
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return false;
    const ext = filename.substring(lastDot).toLowerCase();
    return MEDIA_EXTS.has(ext) && (size === 0 || size >= CONFIG.MIN_VIDEO_SIZE);
}

function detectLinkType(link) {
    if (!link) return 'unknown';
    if (link.includes('uc.cn') || link.includes('uc.com')) return 'uc';
    if (link.includes('quark.cn') || link.includes('quark.com')) return 'quark';
    if (link.includes('pan.baidu.com')) return 'baidu';
    if (link.includes('alipan.com') || link.includes('aliyundrive.com')) return 'aliyun';
    if (link.includes('189.cn') || link.includes('cloud.189.cn')) return 'tianyi';
    if (link.includes('139.com') || link.includes('caiyun.139.com')) return 'mobile';
    if (link.includes('123pan.com') || link.includes('123912.com') || link.includes('123684.com') || link.includes('123685.com') || link.includes('123592.com')) return '123';
    return 'unknown';
}

function getResolution(filename) {
    if (!filename) return 'Other';
    const nameLower = filename.toLowerCase();
    for (const res of appConfig.resolutions) {
        if (res.patterns.some(pattern => nameLower.includes(pattern))) return res.key;
    }
    return 'Other';
}

function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

function extractEpisodeNumber(name) {
    const matches = name.match(/[第\s_\-](\d+)[集话]/i) ||
                   name.match(/\b(?:EP|ep|E|e)\s?(\d+)\b/i) ||
                   name.match(/[\s\-_](\d{2,3})\b(?!k|p|b)/i);
    return matches ? parseInt(matches[1]) : null;
}

// =================== 标题标准化 ===================
function basicClean(str) {
    return str
        .replace(REGEX_PATTERNS.htmlTags, '')
        .replace(/[\u0000-\u001F\u007F-\u009F\uFFFD\uFEFF]/g, '')
        .replace(/[üá∫óéêëèïîìôöòûùÿáéíóúýàèìòùâêîôûäëïöüÿ]/g, '')
        .replace(REGEX_PATTERNS.emoji, '')
        .replace(REGEX_PATTERNS.specialChars, ' ')
        .replace(REGEX_PATTERNS.duplicateWords, '$1')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function standardizeTitle(originalName) {
    if (!originalName || originalName.trim() === '') {
        return { title: '未知标题', tags: [] };
    }

    const usefulTags = new Set();
    const matches = originalName.match(REGEX_PATTERNS.tagExtraction);
    if (matches) {
        matches.forEach(tag => usefulTags.add(tag.toUpperCase().trim()));
    }

    let coreName = basicClean(originalName);
    const isCollection = coreName.includes('合集') || coreName.includes('系列') || coreName.includes('十部曲') || coreName.includes('全集');
    let year = '';

    const yearMatch = coreName.match(/([\(（])(\d{4})([\)）])/);
    if (yearMatch) {
        year = yearMatch[2].trim();
        const yearIndex = coreName.indexOf(yearMatch[0]);
        if (yearIndex !== -1) {
            coreName = coreName.substring(0, yearIndex).trim();
        }
    }

    coreName = coreName
        .replace(/^(电视剧|🗄|🎬|综艺|P|国剧：|电影|名称：|\s*【.*?】)\s*/i, '')
        .replace(/[\.\-\_\/\|]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    coreName = coreName.replace(/^[\[\(\{【<《].*?[\]\)\}\】>》]\s*/g, ' ').trim();

    if (!isCollection) {
        coreName = coreName
            .replace(/\b(S|Season)\s*\d+\s*(E|Episode|Part)?\s*\d+\b/gi, ' ')
            .replace(/\s*\b(S|Season)\s*\d+\b/gi, ' ')
            .replace(/\s*(全|更新至|更新|更至|第)\s*\d*[集季话]?.*/i, '')
            .replace(/\s*\d+[集季话]\s*/gi, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    coreName = coreName
        .replace(REGEX_PATTERNS.brackets, ' ')
        .replace(REGEX_PATTERNS.angleBrackets, ' ')
        .replace(REGEX_PATTERNS.parentheses, ' ')
        .replace(REGEX_PATTERNS.NoiseWords, ' ')
        .replace(/\s\b(\d+|[a-z])\b\s/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    coreName = coreName.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '').trim();

    if (!coreName || coreName.length < 2) {
        coreName = originalName.replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]/g, '').trim().substring(0, CONFIG.TITLE_FALLBACK_LENGTH) || '未知标题';
    }

    if (year && !coreName.endsWith(`(${year})`) && !coreName.endsWith(`（${year}）`)) {
        coreName = `${coreName} (${year})`.trim();
    }

    return { title: coreName.substring(0, CONFIG.TITLE_MAX_LENGTH), tags: Array.from(usefulTags) };
}

function cleanTrackNameForDisplay(originalName) {
    if (!originalName || originalName.trim() === '') return '未知文件';
    if (originalName.length < CONFIG.TRACK_SHORT_NAME_LIMIT) return originalName.trim();

    let name = originalName
        .replace(REGEX_PATTERNS.htmlTags, '')
        .replace(REGEX_PATTERNS.emoji, '')
        .replace(REGEX_PATTERNS.specialChars, '');

    name = name
        .replace(/【[^】]*】/g, ' ')
        .replace(REGEX_PATTERNS.lightNoiseWords, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    const lastDot = name.lastIndexOf('.');
    if (lastDot !== -1 && MEDIA_EXTS.has(name.substring(lastDot).toLowerCase())) {
        name = name.slice(0, lastDot);
    }

    return name.trim() || originalName.trim();
}

// =================== VOD 协议函数 (UC/夸克/百度) ===================
function buildTempPath(shareLink, linkType) {
    const decodedLink = safeDecode(shareLink);
    if (linkType === 'uc' || linkType === 'quark') {
        const match = decodedLink.match(/s\/([a-z0-9]+)/i);
        if (!match) return null;
        return linkType === 'uc'
            ? `/我的UC分享/temp/uc@${match[1]}@`
            : `/我的夸克分享/temp/quark@${match[1]}@`;
    }
    if (linkType === 'baidu') {
        const idMatch = decodedLink.match(/s\/([a-zA-Z0-9_-]+)/);
        const pwdMatch = decodedLink.match(/pwd=([a-zA-Z0-9]+)/);
        if (!idMatch) return null;
        return `/我的百度分享/temp/baidu@${idMatch[1]}@${pwdMatch ? pwdMatch[1] : ''}`;
    }
    return null;
}

async function fetchVideosRecursively(path, linkType, depth = 1, maxDepth = CONFIG.MAX_RECURSION_DEPTH, stats = { directories: 0, files: 0 }, maxFiles = CONFIG.MAX_SEARCH_RESULTS) {
    if (depth > maxDepth || stats.files >= maxFiles || stats.directories >= CONFIG.VOD_MAX_DIRECTORIES) return [];

    stats.directories++;
    const encodedPath = path.split('/').map(p => encodeURIComponent(p).replace(/%2F/g, '/')).join('/');
    const url = `${CONFIG.SITE}/vod/${CONFIG.SERVER_TOKEN}?ac=web&pg=1&size=${CONFIG.VOD_PAGE_SIZE}&t=1$${encodedPath}$1`;

    try {
        const { data } = await safeFetch(url, { headers: getSessionHeaders() });
        if (!data) return [];

        const json = safeJsonParse(data);
        const videos = (json.list || []).filter(item => item.type === 2 && isLikelyVideoFile(item.vod_name, item.size));
        const folders = (json.list || []).filter(item => item.type === 1);

        let results = videos.map(video => ({
            vod_name: video.vod_name, vod_id: video.vod_id,
            path: cleanPath(video.path || `${path}/${video.vod_name}`),
            size: video.size || 0, vod_play_url: video.vod_play_url || ''
        }));
        stats.files += results.length;

        if (results.length >= maxFiles) return results.slice(0, maxFiles);

        for (let i = 0; i < folders.length && results.length < maxFiles; i += CONFIG.MAX_CONCURRENT_REQUESTS) {
            const chunk = folders.slice(i, i + CONFIG.MAX_CONCURRENT_REQUESTS);
            const subResultsChunk = await Promise.all(chunk.map(folder =>
                fetchVideosRecursively(cleanPath(folder.path), linkType, depth + 1, maxDepth, stats, maxFiles - results.length)
            ));
            results = results.concat(subResultsChunk.flat());
        }

        return results.slice(0, maxFiles);
    } catch (e) { return []; }
}

// =================== AList 协议函数 (阿里/天翼/123/移动) ===================
async function fetchAList(path) {
    try {
        const { data } = await safePost(
            `${CONFIG.ALIST_SITE}/api/fs/list`,
            { path, password: '', refresh: false },
            { headers: { 'Content-Type': 'application/json', 'x-api-key': ALIST_KEY }, timeout: CONFIG.ALIST_LIST_TIMEOUT }
        );
        const json = safeJsonParse(data);
        if (json.code !== 200 || !json.data) throw new Error(json.message || 'AList API error');
        return json.data.content || [];
    } catch (e) { return []; }
}

async function analyzeFolder(path) {
    try {
        const items = await fetchAList(path);
        if (!items || items.length === 0) return { hasVideo: false, count: 0, remarks: '', size: 0, isMultiDir: false };

        let videoCount = 0, maxEp = 0, totalSize = 0, dirCount = 0;

        for (const item of items.slice(0, CONFIG.ALIST_ANALYZE_LIMIT)) {
            if (item.is_dir) { dirCount++; continue; }
            if (isLikelyVideoFile(item.name)) {
                videoCount++;
                totalSize += item.size || 0;
                const match = item.name.match(/(?:E|ep|第|\.)(\d+)(?:[集话]|\.|$)/i);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num < 1000 && num > maxEp) maxEp = num;
                }
            }
        }

        let remarks = '';
        const hasEnoughVideo = videoCount > 0 && (totalSize >= CONFIG.MIN_VIDEO_SIZE || dirCount > 0);
        if (videoCount > 1 || dirCount > 0) {
            if (maxEp > 0) remarks = `更至${maxEp}集`;
            else if (videoCount > 0) remarks = `共${videoCount}集`;
            else if (dirCount > 0) remarks = '含多目录';
        }

        return { hasVideo: hasEnoughVideo, count: videoCount, remarks, size: totalSize, isMultiDir: dirCount > 0 };
    } catch (e) { return { hasVideo: false, count: 0, remarks: '', size: 0, isMultiDir: false }; }
}

async function fetchAllFiles(currentPath, maxDepth = CONFIG.MAX_RECURSION_DEPTH, depth = 0, allFiles = [], maxFiles = CONFIG.MAX_SEARCH_RESULTS, stats = { directories: 0 }) {
    if (depth > maxDepth || allFiles.length >= maxFiles) return allFiles;
    stats.directories++;
    const items = await fetchAList(currentPath);
    if (!items || items.length === 0) return allFiles;

    const directories = items.filter(item => item.is_dir);
    const files = items.filter(item => !item.is_dir && isLikelyVideoFile(item.name) && item.size >= CONFIG.MIN_VIDEO_SIZE);

    for (const item of files) {
        if (allFiles.length >= maxFiles || !item.name) break;
        allFiles.push({ name: item.name, path: cleanPath(`${currentPath}/${item.name}`) });
    }

    if (allFiles.length >= maxFiles) return allFiles;
    const validDirs = await Promise.all(directories.map(async item => {
        const itemPath = cleanPath(`${currentPath}/${item.name}`);
        const analysis = await analyzeFolder(itemPath);
        return (analysis.count > 0 && analysis.size >= CONFIG.MIN_VIDEO_SIZE) || analysis.isMultiDir ? itemPath : null;
    })).then(results => results.filter(path => path !== null));

    for (let i = 0; i < validDirs.length && allFiles.length < maxFiles; i += CONFIG.MAX_CONCURRENT_REQUESTS) {
        const chunk = validDirs.slice(i, i + CONFIG.MAX_CONCURRENT_REQUESTS);
        await Promise.all(chunk.map(dirPath => fetchAllFiles(dirPath, maxDepth, depth + 1, allFiles, maxFiles, stats)));
    }
    return allFiles;
}

// =================== 验证函数 (根据云盘类型路由) ===================
async function validateShareLink(shareLink, linkType) {
    if (!shareLink) return { valid: false, reason: 'Empty_Link', path: '' };

    try {
        const decodedLink = decodeURIComponent(shareLink);

        if (isVodType(linkType)) {
            if (linkType === 'baidu') {
                if (!decodedLink.match(/s\/([a-zA-Z0-9_-]+)/)) return { valid: false, reason: 'Baidu_ID_Missing', path: '' };
            } else if (linkType === 'uc' || linkType === 'quark') {
                if (!decodedLink.match(/s\/([a-z0-9]+)/i)) return { valid: false, reason: 'Shortcode_Missing', path: '' };
            }
        }

        const response = await safePost(
            `${CONFIG.SITE}/api/share-link`,
            { link: shareLink },
            { headers: getSessionHeaders(), timeout: CONFIG.VALIDATE_TIMEOUT }
        );

        const path = typeof response.data === 'string' ? response.data.trim() : (response.data?.path || '');

        return { valid: response.status === 200, reason: response.status === 200 ? 'Success' : 'Link_Invalid', path };
    } catch (e) {
        return { valid: false, reason: e.message.includes('timeout') ? 'Request_Timeout' : (e.message.includes('404') ? 'Link_Invalid' : 'Network_Error'), path: '' };
    }
}

// 分析分享链接内容 (VOD 类型)
async function analyzeVodContents(shareLink, linkType) {
    const tempPath = buildTempPath(shareLink, linkType);
    if (!tempPath) return { hasVideo: false, videoCount: 0, maxResolution: '', totalSize: '' };

    try {
        const videos = await fetchVideosRecursively(tempPath, linkType, 1, 2, { directories: 0 }, CONFIG.VOD_VALIDATE_MAX_FILES);
        let totalSizeBytes = 0, maxRes = 'Other';

        for (const video of videos) {
            totalSizeBytes += (video.size || 0);
            const res = getResolution(video.vod_name);
            if (res === '4K') maxRes = '4K';
            else if (res === '1080P' && maxRes !== '4K') maxRes = '1080P';
            else if (res === '720P' && maxRes === 'Other') maxRes = '720P';
        }

        return {
            hasVideo: videos.length > 0,
            videoCount: videos.length,
            maxResolution: maxRes === 'Other' ? '' : maxRes,
            totalSize: totalSizeBytes > 0 ? formatFileSize(totalSizeBytes) : ''
        };
    } catch (e) { return { hasVideo: false, videoCount: 0, maxResolution: '', totalSize: '' }; }
}

// 统一分析入口
async function analyzeContents(shareLink, linkType, shareLinkPath = '') {
    if (isVodType(linkType)) {
        return await analyzeVodContents(shareLink, linkType);
    }
    if (isAlistType(linkType) && shareLinkPath) {
        const analysis = await analyzeFolder(shareLinkPath);
        return {
            hasVideo: analysis.hasVideo,
            videoCount: analysis.count,
            maxResolution: '',
            totalSize: analysis.size > 0 ? formatFileSize(analysis.size) : '',
            remarks: analysis.remarks
        };
    }
    return { hasVideo: false, videoCount: 0, maxResolution: '', totalSize: '' };
}

// =================== 搜索函数 ===================
function convertAPIResult(apiData) {
    const rawList = [];
    if (!apiData || !apiData.merged_by_type) return rawList;

    for (const [cloudType, items] of Object.entries(apiData.merged_by_type)) {
        if (!CLOUD_TYPE_MAP[cloudType] || !Array.isArray(items)) continue;

        const maxItems = (cloudType === 'quark' || cloudType === 'baidu') ? CONFIG.MAX_QUARK_BAIDU_RESULTS : Infinity;
        const typeList = items.slice(0, maxItems);

        for (const item of typeList) {
            const decodedUrl = safeDecode(item.url || '');
            rawList.push({
                vod_id: decodedUrl,
                vod_name: item.note || '',
                vod_pic: (item.images && item.images.length > 0) ? item.images[0] : (DEFAULT_IMAGES[cloudType] || FALLBACK_POSTER),
                vod_remarks: CLOUD_TYPE_MAP[cloudType] || cloudType,
                vod_content: item.source || '',
                cloud_type: cloudType,
                datetime: item.datetime,
                source: item.source,
                raw_item: item,
                size: item.size || 0,
                ext: { url: decodedUrl, linkType: cloudType, source: item, raw: item }
            });
        }
    }
    return rawList;
}

function buildDescriptionForItem(item, analysis) {
    const lines = [];
    const sourceInfo = (item.source || item.raw_item?.source || item.vod_content || '')
        .replace(/^tg:\s*/i, '').replace(/^来源:\s*/, '').trim();

    if (sourceInfo || item.cloud_type) {
        const parts = [];
        if (sourceInfo) parts.push(`📢 来源：${sourceInfo}`);
        if (item.cloud_type && CLOUD_TYPE_MAP[item.cloud_type]) parts.push(`☁️ 云盘：${CLOUD_TYPE_MAP[item.cloud_type]}`);
        if (parts.length > 0) lines.push(parts.join(' | '));
    }

    if (analysis) {
        const parts = [];
        if (analysis.videoCount > 0) parts.push(`🎬 数量：${analysis.videoCount}个`);
        if (analysis.maxResolution) parts.push(`📺 分辨率：${analysis.maxResolution}`);
        if (analysis.totalSize) parts.push(`💾 大小：${analysis.totalSize}`);
        else if (item.size > 0) parts.push(`💾 大小：${formatFileSize(item.size)}`);
        if (analysis.remarks) parts.push(`📊 ${analysis.remarks}`);
        if (parts.length > 0) lines.push(parts.join(' | '));
    } else if (item.size > 0) {
        lines.push(`💾 大小：${formatFileSize(item.size)}`);
    }

    if (item.datetime) {
        try {
            const date = new Date(item.datetime);
            lines.push(`📅 发布时间：${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
        } catch (e) {}
    }

    return lines.join('\n') || '';
}

function buildSmartFilter(searchText) {
    return { exclude: [...(CONFIG.SEARCH_FILTER.exclude || [])] };
}

async function fetchSearchResults(text, cloudTypes, filterParam) {
    const url = `${CONFIG.SEARCH_API_BASE}/api/search?kw=${encodeURIComponent(text)}&cloud_types=${cloudTypes}${filterParam}`;
    const { data } = await safeFetch(url, { headers: { 'User-Agent': CONFIG.UA, 'Referer': CONFIG.SEARCH_API_BASE + '/' } });
    const json = safeJsonParse(data);
    if (json.code !== 0) throw new Error(`搜索API返回错误: ${json.message}`);
    if (json.data && json.data.total === 0) return [];
    return convertAPIResult(json.data);
}

async function validateSingleItem(item, validList, processedCount) {
    const linkType = item.cloud_type || item.ext?.linkType || detectLinkType(item.vod_id);
    if (!CLOUD_TYPE_MAP[linkType]) return processedCount;

    const { valid, path: sharePath } = await validateShareLink(item.vod_id, linkType);
    if (!valid) return processedCount;

    let analysis;
    if (isVodType(linkType)) {
        analysis = await analyzeVodContents(item.vod_id, linkType);
    } else if (isAlistType(linkType) && sharePath) {
        analysis = await analyzeContents(item.vod_id, linkType, sharePath);
    }
    if (!analysis) return processedCount;
    if (!analysis.hasVideo) return processedCount;

    const { title: standardizedTitle, tags } = standardizeTitle(item.vod_name || '未知资源');
    let finalRemarks = tags.length > 0 ? (item.vod_remarks ? `${item.vod_remarks} | ${tags.join(' ')}` : tags.join(' ')) : item.vod_remarks;
    if (analysis && analysis.maxResolution) {
        finalRemarks = finalRemarks ? `${finalRemarks} | ${analysis.maxResolution}` : analysis.maxResolution;
    }
    if (analysis && analysis.remarks) {
        finalRemarks = finalRemarks ? `${finalRemarks} | ${analysis.remarks}` : analysis.remarks;
    }

    validList.push({
        vod_id: item.vod_id,
        vod_name: standardizedTitle,
        vod_pic: item.vod_pic || FALLBACK_POSTER,
        vod_remarks: finalRemarks,
        vod_content: buildDescriptionForItem(item, analysis),
        ext: { url: [item.vod_id], vod_id: item.vod_id, source: item, linkType, cloud_type: linkType, alistPath: sharePath || '' }
    });
    return processedCount + 1;
}

async function search(ext) {
    ext = argsify(ext);
    const text = (ext.text || '').trim();
    const sourceFilter = ext.source;

    if (!text) {
        $utils.toastError('搜索关键词为空');
        return jsonify({ list: [] });
    }

    const filterConfig = buildSmartFilter(text);
    $utils.toastInfo(`【网盘搜索】正在搜索「${text || '全部'}」...`);

    try {
        let filterParam = '';
        if (filterConfig && filterConfig.exclude && filterConfig.exclude.length > 0) {
            try { filterParam = `&filter=${encodeURIComponent(JSON.stringify(filterConfig))}`; } catch (e) {}
        }
        const cloudTypes = sourceFilter || ALL_CLOUD_TYPES;

        const rawList = await fetchSearchResults(text, cloudTypes, filterParam);
        if (!rawList || rawList.length === 0) {
            $utils.toastInfo(`【网盘搜索】未找到匹配资源`);
            return jsonify({ list: [] });
        }

        const seenUrls = new Set();
        const filteredList = rawList
            .filter(item => item.vod_id && !seenUrls.has(item.vod_id) && seenUrls.add(item.vod_id))
            .slice(0, CONFIG.MAX_VALIDATE_RESULTS);

        $utils.toastInfo(`正在验证 ${filteredList.length} 个分享链接有效性...`);

        const allValidResults = [];
        let successCount = 0;
        let cursor = 0;
        const searchStartTime = Date.now();

        const worker = async () => {
            while (true) {
                const idx = cursor++;
                if (idx >= filteredList.length || allValidResults.length >= CONFIG.TARGET_RETURN_RESULTS) break;
                if (Date.now() - searchStartTime > CONFIG.MAX_SEARCH_DURATION) break;
                try {
                    successCount = await validateSingleItem(filteredList[idx], allValidResults, successCount);
                    $utils.toastInfo(`验证进度：${idx + 1}/${filteredList.length}，已找到 ${allValidResults.length} 个有效`);
                } catch (e) { logError(`验证条目失败: ${(filteredList[idx]?.vod_id||'').substring(0, 25)}`, e, false); }
            }
        };

        const workerCount = Math.min(CONFIG.MAX_CONCURRENT_REQUESTS, filteredList.length);
        await Promise.all(Array(workerCount).fill(null).map(() => worker()));

        if (Date.now() - searchStartTime > CONFIG.MAX_SEARCH_DURATION && allValidResults.length > 0) {
            $utils.toastInfo(`搜索超时，已返回 ${allValidResults.length} 个有效结果`);
        }

        const seenVodIds = new Set();
        let results = allValidResults.filter(item => !seenVodIds.has(item.vod_id) && seenVodIds.add(item.vod_id));

        const cloudPriority = { 'uc': 1, 'quark': 2, 'baidu': 3, 'aliyun': 4, 'tianyi': 5, '123': 6, 'mobile': 7 };
        results.sort((a, b) => (cloudPriority[a.cloud_type] || 8) - (cloudPriority[b.cloud_type] || 8));
        results = results.slice(0, CONFIG.TARGET_RETURN_RESULTS);

        $utils.toastInfo(`搜索完成，找到【${results.length}】个有效资源！`);
        return jsonify({ list: results });
    } catch (e) {
        logError('搜索失败', e);
        return jsonify({ list: [] });
    }
}

// =================== 获取剧集列表与豆瓣卡片解析 ===================

async function collectTgdbFiles(item, groupTracks, globalSeen) {
    const ct = item.cloud_type || '';
    const label = CLOUD_TYPE_MAP[ct] || ct;
    if (!groupTracks[label]) groupTracks[label] = [];
    const linkType = item.ext?.linkType || ct;

    try {
        if (isVodType(linkType)) {
            await safePost(`${CONFIG.SITE}/api/share-link`,
                { link: item.vod_id },
                { headers: getSessionHeaders(), timeout: CONFIG.SHARE_LINK_TIMEOUT });

            const tempPath = buildTempPath(item.vod_id, linkType);
            if (!tempPath) return;

            const files = await fetchVideosRecursively(tempPath, linkType, 1,
                CONFIG.MAX_RECURSION_DEPTH, { directories: 0 }, CONFIG.TGDB_RECURSION_MAX_FILES);

            files.forEach(f => {
                const dedupKey = cleanTrackNameForDisplay(f.vod_name);
                if (!globalSeen[dedupKey]) {
                    globalSeen[dedupKey] = true;
                    const playParams = { shareLink: item.vod_id, vod_id: f.vod_id, path: f.path,
                        name: f.vod_name, size: f.size, vod_play_url: f.vod_play_url || '',
                        linkType, serverType: 'vod' };
                    groupTracks[label].push({
                        name: f.vod_name, url: JSON.stringify(playParams),
                        ext: { url: JSON.stringify(playParams), source: f, linkType, serverType: 'vod' }
                    });
                }
            });
        } else if (isAlistType(linkType)) {
            const resp = await safePost(`${CONFIG.SITE}/api/share-link`,
                { link: item.vod_id },
                { headers: getSessionHeaders(), timeout: CONFIG.SHARE_LINK_TIMEOUT });

            const path = typeof resp.data === 'string' ? resp.data.trim() : (resp.data?.path || '');
            if (!path) return;

            const files = await fetchAllFiles(path, CONFIG.MAX_RECURSION_DEPTH, 0, [], CONFIG.TGDB_RECURSION_MAX_FILES, { directories: 0 });
            files.forEach(f => {
                const dedupKey = cleanTrackNameForDisplay(f.name);
                if (!globalSeen[dedupKey]) {
                    globalSeen[dedupKey] = true;
                    const playParams = { path: f.path, name: f.name, linkType, serverType: 'alist', shareLink: item.vod_id };
                    groupTracks[label].push({
                        name: f.name, url: JSON.stringify(playParams),
                        ext: { url: JSON.stringify(playParams), source: f, linkType, serverType: 'alist' }
                    });
                }
            });
        }
    } catch (e) {
        logError(`tg-db单条收集超时或失败: ${(item?.cloud_type||'')} ${(item?.vod_id||'').substring(0, 20)}`, e, false);
    }
}

async function handleTgdbCard(searchName) {
    const cached = TGDB_CACHE.get(searchName);
    const now = Date.now();
    if (cached && (now - cached.timestamp < cached.ttl)) {
        return { list: cached.list, realVodId: cached.realVodId };
    }

    const url = `${CONFIG.SEARCH_API_BASE}/api/search?kw=${encodeURIComponent(searchName)}&cloud_types=${ALL_CLOUD_TYPES}&page=1&limit=${CONFIG.TGDB_SEARCH_LIMIT}`;
    const { data } = await safeFetch(url, { headers: { 'User-Agent': CONFIG.UA, 'Referer': CONFIG.SEARCH_API_BASE + '/' } });
    const json = safeJsonParse(data);
    const rawList = convertAPIResult(json.data);

    if (rawList.length === 0) {
        TGDB_CACHE.set(searchName, { list: [], realVodId: null, timestamp: now, ttl: TGDB_EMPTY_CACHE_TTL });
        return { list: [], realVodId: null };
    }

    const linksByType = {};
    for (const item of rawList) {
        const ct = item.cloud_type || '';
        if (!linksByType[ct]) linksByType[ct] = [];
        if (linksByType[ct].length < CONFIG.TGDB_MAX_LINKS_PER_TYPE && CLOUD_TYPE_MAP[ct]) {
            linksByType[ct].push(item);
        }
    }
    const candidateLinks = Object.values(linksByType).flat();
    if (candidateLinks.length === 0) {
        TGDB_CACHE.set(searchName, { list: [], realVodId: null, timestamp: now, ttl: TGDB_EMPTY_CACHE_TTL });
        return { list: [], realVodId: null };
    }

    const firstValidRealLink = candidateLinks[0]?.vod_id || null;

    const groupTracks = {};
    const globalSeen = {};

    const CONCURRENT_LIMIT = 3;
    for (let i = 0; i < candidateLinks.length; i += CONCURRENT_LIMIT) {
        const chunk = candidateLinks.slice(i, i + CONCURRENT_LIMIT);
        await Promise.all(chunk.map(item => collectTgdbFiles(item, groupTracks, globalSeen)));
    }

    const list = Object.keys(groupTracks).filter(k => groupTracks[k].length > 0).map(k => ({ title: k, tracks: groupTracks[k] }));

    if (TGDB_CACHE.size >= TGDB_CACHE_MAX_SIZE) {
        const firstKey = TGDB_CACHE.keys().next().value;
        if (firstKey) TGDB_CACHE.delete(firstKey);
    }

    const cacheTtl = list.length > 0 ? TGDB_CACHE_TTL : TGDB_EMPTY_CACHE_TTL;
    TGDB_CACHE.set(searchName, { list, realVodId: firstValidRealLink, timestamp: now, ttl: cacheTtl });
    return { list, realVodId: firstValidRealLink };
}

async function resolveVodTracks(shareLink, linkType, cloudName) {
    const tempPath = buildTempPath(shareLink, linkType);
    if (!tempPath) throw new Error(`不支持的${cloudName}网盘链接格式`);

    $utils.toastInfo(`【${cloudName}】正在刷新临时挂载...`);
    const resp = await safePost(`${CONFIG.SITE}/api/share-link`,
        { link: shareLink }, { headers: getSessionHeaders(), timeout: CONFIG.SHARE_LINK_TIMEOUT });
    if (resp.status !== 200) throw new Error(`临时目录刷新失败，状态码: ${resp.status}`);

    const allVideos = await fetchVideosRecursively(tempPath, linkType, 1, CONFIG.MAX_RECURSION_DEPTH, { directories: 0 }, CONFIG.MAX_SEARCH_RESULTS);
    if (allVideos.length === 0) throw new Error(`未找到可播放的视频文件（需>=${formatFileSize(CONFIG.MIN_VIDEO_SIZE)}）`);

    const trackGroups = {};
    appConfig.resolutions.forEach(res => { trackGroups[res.key] = []; });
    allVideos.forEach(video => {
        const playParams = { shareLink, vod_id: video.vod_id, path: video.path, name: video.vod_name, size: video.size, vod_play_url: video.vod_play_url, linkType, serverType: 'vod' };
        const cleanTrackName = cleanTrackNameForDisplay(video.vod_name);
        const sizeText = video.size > 0 ? `(${formatFileSize(video.size)})` : '';
        trackGroups[getResolution(video.vod_name)].push({
            name: `${cleanTrackName} ${sizeText}`.trim(),
            url: JSON.stringify(playParams),
            ext: { url: JSON.stringify(playParams), source: video, linkType, serverType: 'vod' }
        });
    });

    const groupedTracks = appConfig.resolutions
        .filter(res => trackGroups[res.key].length > 0)
        .map(res => {
            const tracks = trackGroups[res.key];
            tracks.sort((a, b) => {
                const aNum = extractEpisodeNumber(a.name); const bNum = extractEpisodeNumber(b.name);
                return (aNum !== null && bNum !== null) ? aNum - bNum : a.name.localeCompare(b.name, 'zh-CN');
            });
            return { title: res.key, tracks };
        });

    $utils.toastInfo(`成功解析【${cloudName}】分享链接，找到【${allVideos.length}】个视频文件`);
    return groupedTracks;
}

async function resolveAlistTracks(shareLink, linkType, cloudName) {
    $utils.toastInfo(`正在解析${cloudName}文件列表...`);
    const resp = await safePost(`${CONFIG.SITE}/api/share-link`,
        { link: shareLink }, { headers: getSessionHeaders(), timeout: CONFIG.SHARE_LINK_TIMEOUT });
    const path = typeof resp.data === 'string' ? resp.data.trim() : (resp.data?.path || '');
    if (!path) throw new Error(`无法解析分享链接路径`);

    const stats = { directories: 0 };
    const videoFiles = await fetchAllFiles(path, CONFIG.MAX_RECURSION_DEPTH, 0, [], CONFIG.MAX_SEARCH_RESULTS, stats);
    if (videoFiles.length === 0) throw new Error('该路径下未找到可播放的视频文件 (需 >50MB)');

    const trackGroups = {};
    appConfig.resolutions.forEach(res => { trackGroups[res.key] = []; });
    videoFiles.forEach(video => {
        const playParams = { path: video.path, name: video.name, linkType, serverType: 'alist', shareLink };
        trackGroups[getResolution(video.name)].push({
            name: video.name, url: JSON.stringify(playParams),
            ext: { url: JSON.stringify(playParams), path: video.path, linkType, serverType: 'alist' }
        });
    });

    Object.keys(trackGroups).forEach(key => {
        trackGroups[key].sort((a, b) => {
            const aNum = extractEpisodeNumber(a.name); const bNum = extractEpisodeNumber(b.name);
            return (aNum !== null && bNum !== null) ? aNum - bNum : a.name.localeCompare(b.name, 'zh-CN');
        });
    });

    const groupedList = appConfig.resolutions.filter(res => trackGroups[res.key].length > 0).map(res => ({ title: res.key, tracks: trackGroups[res.key] }));
    $utils.toastInfo(`解析成功，找到【${videoFiles.length}】个视频剧集`);
    return groupedList;
}

async function getTracks(ext) {
    ext = argsify(ext);
    const shareLink = (ext.url && ext.url[0]) || ext.vod_id;
    if (!shareLink) {
        $utils.toastError('未提供分享链接');
        return jsonify({ list: [] });
    }

    if (shareLink.startsWith('s:')) {
        const searchName = ext.name || shareLink.slice(2);
        if (!searchName) {
            $utils.toastError('无法解析影片名称');
            return jsonify({ list: [] });
        }
        $utils.toastInfo(`正在搜索「${searchName}」云盘资源,请等待...`);
        try {
            const { list: groupedList, realVodId } = await handleTgdbCard(searchName);
            if (groupedList.length === 0) {
                $utils.toastInfo('未找到可播放的视频文件');
                return jsonify({ list: [] });
            }
            const total = groupedList.reduce((s, g) => s + g.tracks.length, 0);
            $utils.toastInfo(`解析成功，找到【${total}】个视频文件`);
            if (realVodId) {
                return jsonify({ vod_id: realVodId, list: groupedList });
            }
            return jsonify({ list: groupedList });
        } catch (e) {
            $utils.toastError('搜索失败');
            return jsonify({ list: [] });
        }
    }

    const linkType = ext.linkType || ext.cloud_type || detectLinkType(shareLink);
    const cloudName = CLOUD_TYPE_MAP[linkType] || '未知';

    try {
        let groupedTracks;
        if (isVodType(linkType)) {
            groupedTracks = await resolveVodTracks(shareLink, linkType, cloudName);
        } else if (isAlistType(linkType)) {
            groupedTracks = await resolveAlistTracks(shareLink, linkType, cloudName);
        } else {
            $utils.toastError(`不支持的云盘类型: ${cloudName}`);
            return jsonify({ list: [] });
        }
        return jsonify({ list: groupedTracks });
    } catch (e) {
        logError(`获取播放列表失败`, e);
        return jsonify({ list: [] });
    }
}

// =================== 获取播放地址 ===================
async function getPlayinfo(ext) {
    ext = argsify(ext);
    let playParams = {};

    if (typeof ext.url === 'string') {
        try { playParams = JSON.parse(ext.url); }
        catch (e) { playParams = { shareLink: ext.url, vod_id: ext.vod_id || ext.url, name: ext.name || '未知视频' }; }
    } else {
        playParams = ext.url || { shareLink: ext.shareLink || ext.vod_id, vod_id: ext.vod_id, name: ext.name, path: ext.path };
    }

    const serverType = playParams.serverType || 'vod';
    const realVodId = playParams.shareLink || null;

    if (serverType === 'alist') {
        const path = playParams.path || ext.path;
        if (!path) {
            $utils.toastError('播放路径为空');
            return jsonify({ urls: [] });
        }

        try {
            $utils.toastInfo('正在获取播放地址...');
            const { data } = await safePost(`${CONFIG.ALIST_SITE}/api/fs/get`, { path, password: '' }, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': ALIST_KEY },
                timeout: CONFIG.ALIST_LIST_TIMEOUT
            });
            const playData = safeJsonParse(data);
            const playUrl = playData.data?.raw_url;

            if (playUrl) {
                $utils.toastInfo('播放地址获取成功');
                return jsonify({ urls: [playUrl], headers: getSessionHeaders(), vod_id: realVodId });
            }
            const altUrl = CONFIG.ALIST_SITE + '/d' + encodeURI(path);
            return jsonify({ urls: [altUrl], headers: getSessionHeaders(), vod_id: realVodId });
        } catch (e) {
            $utils.toastError(`获取播放信息失败`);
            return jsonify({ urls: [] });
        }

    } else {
        const { shareLink, vod_id } = playParams;
        if (!vod_id) {
            $utils.toastError('播放参数缺失（文件ID）');
            return jsonify({ urls: [] });
        }

        try {
            $utils.toastInfo('正在获取播放地址...');
            if (shareLink) {
                try { await safePost(`${CONFIG.SITE}/api/share-link`, { link: shareLink }, { headers: getSessionHeaders(), timeout: CONFIG.SHARE_LINK_TIMEOUT }); } catch (e) { logError(`播放前挂载失败: ${(shareLink||'').substring(0, 25)}`, e, false); }
            }

            const { data } = await safeFetch(`${CONFIG.SITE}/vod/${CONFIG.SERVER_TOKEN}?ac=web&ids=${vod_id}`, { headers: getSessionHeaders() });
            const json = safeJsonParse(data);
            let playUrl = json.vod_play_url || json.data?.vod_play_url || json.play_url || '';

            if (playUrl) {
                playUrl = playUrl.startsWith('/') ? CONFIG.SITE + playUrl : playUrl;
                $utils.toastInfo('播放地址获取成功');
                return jsonify({ urls: [playUrl], headers: getSessionHeaders(), vod_id: realVodId });
            }

            const vodParts = vod_id.split('$');
            if (vodParts.length >= 2) {
                $utils.toastInfo('播放地址获取成功');
                return jsonify({ urls: [`${CONFIG.SITE}/p/${CONFIG.SERVER_TOKEN}/${vodParts[0]}@${vodParts[1]}`], headers: getSessionHeaders(), vod_id: realVodId });
            }

            $utils.toastError('无法解析播放地址');
            return jsonify({ urls: [] });

        } catch (e) {
            const vodParts = vod_id.split('$');
            if (vodParts.length >= 2) {
                return jsonify({ urls: [`${CONFIG.SITE}/p/${CONFIG.SERVER_TOKEN}/${vodParts[0]}@${vodParts[1]}`], headers: getSessionHeaders(), vod_id: realVodId });
            }
            $utils.toastError(`获取播放信息失败`);
            return jsonify({ urls: [] });
        }
    }
}

// =================== 获取配置 ===================
async function getConfig() {
    return jsonify({
        ver: 13,
        title: appConfig.title,
        site: appConfig.site,
        tabs: appConfig.tabs,
        resolutions: appConfig.resolutions
    });
}

// =================== 获取首页卡片 ===================
async function getCards(ext) {
    ext = argsify(ext);
    const text = (ext.text || '').trim();

    if (text) {
        $utils.toastInfo(`【网盘搜索】正在搜索「${text}」...`);
        return await search(ext);
    }

    if (ext.id) {
        return await getDbCards(ext);
    }

    const defaultContent = [
        {
            vod_id: "guide_1", vod_name: "网盘搜索使用说明", vod_pic: FALLBACK_POSTER, vod_remarks: "必读 · 新手",
            vod_content: "📖 使用方法：\n1. 在搜索框输入电影、电视剧、动漫名称\n2. 系统自动聚合搜索 UC、夸克、百度、阿里、天翼、移动、123 网盘\n3. 自动验证链接有效性 + 视频数量 + 分辨率\n4. 选择资源后点击播放即可秒播\n\n⚡ 统一版优势：一次搜索覆盖7大网盘",
            ext: { url: [], name: "使用说明" }
        },
        {
            vod_id: "guide_2", vod_name: "搜索技巧提示", vod_pic: FALLBACK_POSTER, vod_remarks: "技巧 · 提升命中率",
            vod_content: "🔍 搜索建议：\n• 输入完整影片名（如《盗梦空间》）\n• 可加年份（如《盗梦空间 2010》）\n• 电视剧可直接搜名称，自动识别集数\n• 支持拼音搜索\n• 避免过多符号，系统已智能过滤",
            ext: { url: [], name: "搜索技巧" }
        },
        {
            vod_id: "guide_3", vod_name: "支持云盘与特性", vod_pic: FALLBACK_POSTER, vod_remarks: "七大网盘",
            vod_content: "☁️ 当前支持云盘：\n• UC网盘（速度快）\n• 夸克网盘（资源多）\n• 百度网盘（大文件稳定）\n• 阿里云盘（资源丰富）\n• 天翼云盘（大文件稳定）\n• 移动云盘（下载不限速）\n• 123云盘（分享便捷）\n\n✅ 特性：自动过滤非视频资源、智能排序、缓存加速",
            ext: { url: [], name: "云盘支持" }
        }
    ];
    return jsonify({ list: defaultContent });
}

async function getDbCards(ext) {
    const page = ext.page || 1;
    const url = `${CONFIG.TG_DB_URL}?ac=web&size=${CONFIG.TGDB_PAGE_SIZE}&t=${encodeURIComponent(ext.id)}&pg=${page}`;

    try {
        const { data } = await safeFetch(url);
        const json = safeJsonParse(data);
        const items = json.list || [];

        if (items.length === 0) return jsonify({ list: [] });

        const list = items.map((item, i) => ({
            vod_id: item.vod_id || (ext.id + '_' + i),
            vod_name: item.vod_name || '',
            vod_pic: item.vod_pic || FALLBACK_POSTER,
            vod_remarks: item.vod_remarks || '',
            vod_content: item.vod_content || '',
            ext: { url: [item.vod_id], name: item.vod_name || '' }
        }));

        return jsonify({ list });
    } catch (e) {
        return jsonify({ list: [] });
    }
}
