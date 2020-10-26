import * as vscode from "vscode";
import * as fs from "fs";
import *  as path from "path";
import { Utility } from "../../common/utility";
import { Logger } from '../../common/logger';
const logger = Logger.instance;
// 主要功能页
export class WelcomeWebView {

    /**
     * 执行回调函数
     * @param {*} panel 
     * @param {*} message 
     * @param {*} resp 
     */
    public static invokeCallback(panel, message, resp) {
        logger.debug('回调消息：{}', resp);
        // 错误码在400-600之间的，默认弹出错误提示
        if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
            vscode.window.showErrorMessage(resp.message || '发生未知错误！');
        }
        panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
    }

    /**
     * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
     */
    public static messageHandler = {
        getConfig(global, message) {
            const result = vscode.workspace.getConfiguration().get(message.key);
            WelcomeWebView.invokeCallback(global.panel, message, result);
        },
        setConfig(global, message) {
            // 写入配置文件，注意，默认写入工作区配置，而不是用户配置，最后一个true表示写入全局用户配置
            vscode.workspace.getConfiguration().update(message.key, message.value, true);
            vscode.window.showErrorMessage('修改配置成功！');
        }
    };


    public static init(context) {

        context.subscriptions.push(vscode.commands.registerCommand('extension.demo.showWelcome', function (uri) {
            const panel = vscode.window.createWebviewPanel(
                'testWelcome', // viewType
                "自定义欢迎页", // 视图标题
                vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                {
                    enableScripts: true, // 启用JS，默认禁用
                }
            );
            let global = { panel };
            panel.webview.html = Utility.getWebViewContent(context, 'src/pages/welcome/custom-welcome.html');
            panel.webview.onDidReceiveMessage(message => {
                logger.debug("收到消息:", message)
                if (WelcomeWebView.messageHandler[message.cmd]) {
                    WelcomeWebView.messageHandler[message.cmd](global, message);
                } else {
                    vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
                }
            }, undefined, context.subscriptions);
        }));
        vscode.commands.executeCommand('extension.demo.showWelcome');

        // const key = 'vscodePluginDemo.showTip';
        // // 如果设置里面开启了欢迎页显示，启动欢迎页
        // if (vscode.workspace.getConfiguration().get(key)) {
        // }
    };

}