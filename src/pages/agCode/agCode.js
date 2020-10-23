const vscode = acquireVsCodeApi();
const callbacks = {};

/**
 * 调用vscode原生api
 * @param data 可以是类似 {cmd: 'xxx', param1: 'xxx'}，也可以直接是 cmd 字符串
 * @param cb 可选的回调函数
 */
function callVscode(data, cb) {
    if (typeof data === 'string') {
        data = { cmd: data };
    }
    if (cb) {
        // 时间戳加上5位随机数
        const cbid = Date.now() + '' + Math.round(Math.random() * 100000);
        callbacks[cbid] = cb;
        data.cbid = cbid;
    }
    vscode.postMessage(data);
}

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.cmd) {
        case 'vscodeCallback':
            logger.debug(message.data);
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid];
            break;
        default: break;
    }
});


/**
 * 表信息
 */
function getTableInfoHtml(data) {

    return `
    <div>
        <label for="male">表名:${data.tableName}</label> 
        <table>
            <tr>
                <th>字段名称</th>
                <th>字段类型</th>
                <th>注释</th>
            </tr>
            ${data.columnList.map(item => {
        return `
                <tr>
                <td>${item.columnName}</td>
                <td>${item.columnType}</td>
                <td>${item.columnComment}</td>
                </tr>`
    }).join('')}    
            
        </table>
    </div>
    `;





}


/**
 * 初始化
 */
function init() {
    logger.debug('agCode init 开始')
    callVscode({ cmd: 'getTableInfo' }, response => {
        logger.debug('response', JSON.stringify(response))
        // $("#columnList").append("<option value='Value'>Text</option>");
        $("#tableInfo").html(getTableInfoHtml(response));
    });

}

init();
// logger.debug("选择的code", $("#code").text());
// $("#code").text("Dolly Duck");
