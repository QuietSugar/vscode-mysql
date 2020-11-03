import * as vscode from "vscode";
import * as fs from "fs";
import *  as path from "path";
import * as uuidv1 from "uuid/v1";
import { INode } from "../model/INode";
import { MySQLTreeDataProvider } from "../mysqlTreeDataProvider";
import { ConnectionNode } from "../model/connectionNode";
import { DatabaseNode } from "../model/databaseNode";

import { Constants } from "../common/constants";
import { VelocityUtils } from "../common/velocityUtils";

import { ITemplate } from "../model/template";
import { TableNode } from "../model/tableNode";
import { TableInfo, ColumnInfo } from "../model/tableInfo";
import { Utility } from "../common/utility";
import { Logger } from '../common/logger';
import { JavaBeanInfo } from "../model/javaBeanInfo";
const logger = Logger.instance;
// 主要功能页
export class DatabaseService {
    private tableNode: TableNode;
    private context: vscode.ExtensionContext

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    };
    /**
     *   初始化
     */
    public init() {
        this.context.subscriptions.push(
            vscode.commands.registerCommand(
                "template.aiCode",
                (tableNode: TableNode) => {
                    vscode.window.showInformationMessage('您执行了template.aiCode 命令！');
                    if (!tableNode.columnList) {
                        tableNode.getChildren();
                    }
                    this.tableNode = tableNode;

                    // 打开一个页面
                    const panel: vscode.WebviewPanel = vscode.window.createWebviewPanel(
                        'result', // viewType
                        "自动生成", // 视图标题
                        vscode.ViewColumn.One, // 显示在编辑器的哪个部位
                        {
                            enableScripts: true, // 启用JS，默认禁用
                        }
                    );
                    panel.webview.html = Utility.getWebViewContent(context, 'src/pages/agCode/agCode.html');
                    panel.webview.onDidReceiveMessage(
                        message => {
                            logger.debug("收到消息:", message)
                            this.messageHandler(message, panel)
                        }
                        , undefined, this.context.subscriptions);


                }));
        // 树形菜单数据
        const mysqlTreeDataProvider = new MySQLTreeDataProvider(this.context);
        this.context.subscriptions.push(vscode.window.registerTreeDataProvider("codeAssistant.database", mysqlTreeDataProvider));
        // 刷新
        this.context.subscriptions.push(vscode.commands.registerCommand("database.refresh", (node: INode) => {
            mysqlTreeDataProvider.refresh(node);
        }));
        // 添加链接
        this.context.subscriptions.push(vscode.commands.registerCommand("database.addConnection", () => {
            mysqlTreeDataProvider.addConnection();
        }));
        // 删除链接
        this.context.subscriptions.push(vscode.commands.registerCommand("database.deleteConnection", (connectionNode: ConnectionNode) => {
            connectionNode.deleteConnection(this.context, mysqlTreeDataProvider);
        }));
        // 运行 SQL
        this.context.subscriptions.push(vscode.commands.registerTextEditorCommand(
            "database.runQuery", (textEditor: vscode.TextEditor) => {
                let sql: string;
                if (!sql) {
                    const selection = textEditor.selection;
                    if (selection.isEmpty) {
                        sql = textEditor.document.getText();
                    } else {
                        sql = textEditor.document.getText(selection);
                    }
                }
                Utility.runQuery(sql);
            }));
        // 创建 SQL
        this.context.subscriptions.push(vscode.commands.registerCommand("database.newQuery", (databaseOrConnectionNode: DatabaseNode | ConnectionNode) => {
            databaseOrConnectionNode.newQuery();
        }));
        // 查询 1000 条
        this.context.subscriptions.push(vscode.commands.registerCommand("database.selectTop1000", (tableNode: TableNode) => {
            tableNode.selectTop1000();
        }));

    }

    /**
     * 执行回调函数
     * @param {*} panel 
     * @param {*} message 
     * @param {*} resp 
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
     * 存放所有消息回调函数，根据 message.cmd 来决定调用哪个方法
     */
    private messageHandler(message, panel: vscode.WebviewPanel) {
        let responseData;
        switch (message.cmd) {
            case 'getTableInfo':
                responseData = this.getTableInfo();
                break;
            case 'getTemplateList':
                responseData = this.getTemplateList();
                break;
            case 'genByVelocity':
                responseData = this.genByVelocity(message);
                break;
            default:
                vscode.window.showErrorMessage(`未找到名为 ${message.cmd} 回调方法!`);
        }
        this.invokeCallback(panel, message, responseData);
    };

    /**
    * 获取表的信息, 表名,列信息等
    */
    public getTableInfo(): TableInfo {
        let columnInfoList: Array<ColumnInfo> = new Array<ColumnInfo>();
        this.tableNode.columnList.map((column: any) => {
            let columnInfo = new ColumnInfo(column.COLUMN_NAME, column.COLUMN_TYPE, column.COLUMN_COMMENT);
            columnInfoList.push(columnInfo);
        });
        return new TableInfo(this.tableNode.table, columnInfoList);
    }
    /**
    * 获取模板
    */
    public getTemplateList() {
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
        return responseList;
    }


    /**
     * 
     * 增加模板
     */
    public async addTemplate(name: string, content: string) {
        let templateList = this.context.globalState.get<{ [key: string]: ITemplate }>(Constants.GlobalStateTemplateVelocity);

        if (!templateList) {
            templateList = {};
        }

        const id = uuidv1();
        templateList[id] = {
            id,
            name,
            content,
        };
        await this.context.globalState.update(Constants.GlobalStateTemplateVelocity, templateList);
    }
    /**
      * 生成代码
      */
    public genByVelocity(message) {
        let templateList = this.context.globalState.get<{ [key: string]: ITemplate }>(Constants.GlobalStateTemplateVelocity);
        if (!templateList) {
            templateList = {};
        }
        let response: string;
        let tem: ITemplate = templateList[message.data.templateId];
        if (tem) {
            let tableInfo: TableInfo = this.getTableInfo();
            let javaBeanInfo: JavaBeanInfo = tableInfo.toJavaBean();
            response = VelocityUtils.render(tem.content, {
                ...tableInfo, ...javaBeanInfo, content: "zzzzzzzz"
            });
        } else {
            response = "未找到模板";
        }
        return response;
    }


    /**
     * 通过命令行添加模板
     */
    public async addTemplateByCommand() {
        const name = await vscode.window.showInputBox({ prompt: "模板名称", placeHolder: "模板名称", ignoreFocusOut: true });
        if (!name) {
            return;
        }

        const content = await vscode.window.showInputBox({ prompt: "模板内容", placeHolder: "模板内容", ignoreFocusOut: true });
        if (!content) {
            return;
        }
        this.addTemplate(name, content);
    }

    public async deleteAll() {
        await this.context.globalState.update(Constants.GlobalStateTemplateVelocity, {});
    }

    public openAgWebviewPanel() {

    }


}