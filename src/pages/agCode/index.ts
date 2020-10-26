import * as vscode from "vscode";
import * as fs from "fs";
import *  as path from "path";
import * as uuidv1 from "uuid/v1";
import { Global } from "../../common/global";

import { Constants } from "../../common/constants";

import { ITemplate } from "../../model/template";
import { TableNode } from "../../model/tableNode";
import { ColumnNode } from "../../model/columnNode";
import { TableInfo, ColumnInfo } from "../../model/tableInfo";
import { Utility } from "../../common/utility";
import { MySQLTreeDataProvider } from "../../mysqlTreeDataProvider";
import { Logger } from '../../common/logger';
const logger = Logger.instance;
// 主要功能页
export class AgCode {
    private tableNode: TableNode;
    private context: vscode.ExtensionContext



    /**
     * 执行回调函数
     * @param {*} panel 
     * @param {*} message 
     * @param {*} resp 
     */
    public invokeCallback(panel, message, resp) {
        logger.debug('回调消息：', resp);
        // 错误码在400-600之间的，默认弹出错误提示
        if (typeof resp == 'object' && resp.code && resp.code >= 400 && resp.code < 600) {
            vscode.window.showErrorMessage(resp.message || '发生未知错误！');
        }
        panel.webview.postMessage({ cmd: 'vscodeCallback', cbid: message.cbid, data: resp });
    }

    /**
     * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
     */
    private messageHandler(message, global) {
        switch (message.cmd) {
            case 'getTableInfo':
                this.getTableInfo(message, global);
                return;
            case 'getTemplateList':
                this.getTemplateList(message, global);
                return;
            default:
                vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
        }
    };

    /**
    * 获取表的信息, 表名,列信息等
    */
    public getTableInfo(message, global) {
        let columnInfoList: Array<ColumnInfo> = new Array<ColumnInfo>();
        this.tableNode.columnList.map((column: any) => {
            let columnInfo = new ColumnInfo(column.COLUMN_NAME, column.COLUMN_TYPE, column.COLUMN_COMMENT);
            columnInfoList.push(columnInfo);
        });
        let tableInfo = new TableInfo(this.tableNode.table, columnInfoList);

        this.invokeCallback(global.panel, message, tableInfo);
    }
    /**
    * 获取模板
    */
    public getTemplateList(message, global) {
        let templateList = this.context.globalState.get<{ [key: string]: ITemplate }>(Constants.GlobalStateTemplateVelocity);
        if (!templateList) {
            templateList = {};
        }
        let responseList: Array<ITemplate> = new Array<ITemplate>();
        for (const key of Object.keys(templateList)) {
            if (templateList.hasOwnProperty(key)) {
                let tem: ITemplate = templateList[key];
                responseList.push(tem);
            }
        }

        this.invokeCallback(global.panel, message, responseList);
    }


    /**
       * 增加模板
       */
    public async addTemplateList(name: string, content: string) {
        let templateList = this.context.globalState.get<{ [key: string]: ITemplate }>(Constants.GlobalStateTemplateVelocity);

        if (!templateList) {
            templateList = {};
        }

        const id = uuidv1();
        templateList[id] = {
            name,
            content,
        };
        await this.context.globalState.update(Constants.GlobalStateTemplateVelocity, templateList);
    }


    public init(context: vscode.ExtensionContext) {
        this.context = context;


        this.addTemplateList("id1", "模板内容");


        context.subscriptions.push(
            vscode.commands.registerCommand(
                "mysql.aiCode",
                (tableNode: TableNode) => {
                    vscode.window.showInformationMessage('您执行了mysql.aiCode 命令！');
                    if (!tableNode.columnList) {
                        tableNode.getChildren();
                    }
                    this.tableNode = tableNode;

                    // 打开一个页面
                    const panel = vscode.window.createWebviewPanel(
                        'result', // viewType
                        "自动生成", // 视图标题
                        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                        {
                            enableScripts: true, // 启用JS，默认禁用
                        }
                    );
                    let global = { panel };
                    panel.webview.html = Utility.getWebViewContent(context, 'src/pages/agCode/agCode.html');
                    panel.webview.onDidReceiveMessage(
                        message => {
                            logger.debug("收到消息:", message)
                            this.messageHandler(message, global)
                        }
                        , undefined, context.subscriptions);


                    // tableNode.getChildren().then((p:ColumnNode[])=>{
                    //     logger.debug('tableNode.getChildren====',  p );
                    // })
                    // logger.debug("tableNode", tableNode);
                    // Utility.createSQLTextDocument();
                    // Global.activeConnection = {
                    //     host: this.host,
                    //     user: this.user,
                    //     password: this.password,
                    //     port: this.port,
                    //     certPath: this.certPath,
                    // };

                }));



        // vscode.commands.executeCommand('mysql.aiCode');
    };

}