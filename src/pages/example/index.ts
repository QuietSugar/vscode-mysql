import * as vscode from "vscode";
import { Utility } from "../../common/utility";
import { Logger } from '../../common/logger';
const logger = Logger.instance;
// 主要功能页
export class Example {
    /**
     * 本页面命令
     */
    private static webviewPanelCommand: string = "assistant.example";
    private context: vscode.ExtensionContext



    /**
     * 执行回调函数
     * @param {*} panel 
     * @param {*} message 
     * @param {*} resp 返回的数据主体
     */
    public invokeCallback(panel, message, resp) {
        logger.debug('回调消息：{}', resp);
        // 错误码在400-600之间的，默认弹出错误提示
        if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
            vscode.window.showErrorMessage(resp.message || '发生未知错误！');
        }
        panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
    }





    /**
     * 初始化
     * @param context 
     */
    public init(context: vscode.ExtensionContext) {
        this.context = context;
        vscode.window.showInformationMessage(Example.webviewPanelCommand + ' init !');
        logger.debug("init start !")
        context.subscriptions.push(
            vscode.commands.registerCommand(
                Example.webviewPanelCommand,
                () => {
                    // 打开一个页面
                    const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
                        'result', // viewType
                        "Example", // 视图标题
                        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                        {
                            enableScripts: true, // 启用JS，默认禁用
                        }
                    );
                    panel.webview.html = Utility.getWebViewContent(context, 'src/pages/example/example.html');
                    panel.webview.onDidReceiveMessage(
                        message => {
                            logger.debug("收到消息:", message);
                            // panel: vscode. WebviewPanel 

                            let data;
                            switch (message.cmd) {
                                case 'command01':
                                    // 业务处理
                                    logger.debug("case : command01", message);
                                    data = {};
                                    break;
                                case 'command02':
                                    logger.debug("case : command02", message);
                                    data = {};
                                    break;
                                default:
                                    vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
                            }
                            this.invokeCallback(panel, message, data);

                        }
                        , undefined, context.subscriptions);
                }));
        logger.debug("init end !")
    };
}