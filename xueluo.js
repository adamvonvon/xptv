function init(ext) {
    console.log("初始化成功");
}

function home(filter) {
    // 如果 JS 引擎正常工作，XPTV 顶部会显示这两个分类
    return JSON.stringify({
        class: [
            { type_id: '1', type_name: '🟢 测试成功' },
            { type_id: '2', type_name: '下一步' }
        ]
    });
}

function homeVod() {
    return JSON.stringify({ list: [] });
}

function category(tid, pg, filter, extend) {
    return JSON.stringify({ list: [] });
}

function detail(id) {
    return JSON.stringify({ list: [] });
}

function play(flag, id, flags) {
    return JSON.stringify({ url: "" });
}

function search(wd, quick, pg) {
    return JSON.stringify({ list: [] });
}

// 核心：移除 export 关键字，直接使用标准 function 声明供底层引擎调用
function __jsEvalReturn() {
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
