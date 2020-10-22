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
            console.log(message.data);
            (callbacks[message.cbid] || function () { })(message.data);
            delete callbacks[message.cbid];
            break;
        default: break;
    }
});


/**
 * 表信息
 */
function setTableInfo() { 
    // https://blog.csdn.net/xr510002594/article/details/82734011
    let template = `
    <div>
        <table>
            <tr>
                <th>id</th>
                <th>content</th>
                <th>status</th>
                <th>description</th>
                <th>create_time</th>
            </tr>
            <tr>
                <% for(let i=0; i < data.columnList.length; i++) { %>
                    <td><%= data.columnList[i] } %></td>
            </tr>
        </table>
    </div>
    `;




    callVscode({ cmd: 'getTableInfo' }, response => {
        console.log('response',JSON.stringify(response))
        // $("#columnList").append("<option value='Value'>Text</option>");
    });

}


/**
 * 初始化
 */
function init() {
    console.log('agCode init 开始')
    callVscode({ cmd: 'getTableInfo' }, response => {
        console.log('response',JSON.stringify(response))
        // $("#columnList").append("<option value='Value'>Text</option>");
    });

}

init();
// console.log("选择的code", $("#code").text());
// $("#code").text("Dolly Duck");
