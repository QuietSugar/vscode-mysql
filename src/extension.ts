"use strict";
import * as vscode from "vscode";
import { Utility } from "./common/utility";
import { ConnectionNode } from "./model/connectionNode";
import { DatabaseNode } from "./model/databaseNode";
import { INode } from "./model/INode";
import { TableNode } from "./model/tableNode";
import { MySQLTreeDataProvider } from "./mysqlTreeDataProvider";
import { WelcomeWebView } from "./pages/welcome";
import { AgCode } from "./pages/agCode";


export function activate(context: vscode.ExtensionContext) {

    console.log('扩展激活！');
    const mysqlTreeDataProvider = new MySQLTreeDataProvider(context);
    context.subscriptions.push(vscode.window.registerTreeDataProvider("mysql", mysqlTreeDataProvider));

    WelcomeWebView.init(context);

    const  agCode  =  new AgCode();

    agCode.init(context);

    context.subscriptions.push(vscode.commands.registerCommand("mysql.refresh", (node: INode) => {
        mysqlTreeDataProvider.refresh(node);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("mysql.addConnection", () => {
        mysqlTreeDataProvider.addConnection();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("mysql.deleteConnection", (connectionNode: ConnectionNode) => {
        connectionNode.deleteConnection(context, mysqlTreeDataProvider);
    }));

    context.subscriptions.push(vscode.commands.registerCommand("mysql.runQuery", () => {
        Utility.runQuery();
    }));

    context.subscriptions.push(vscode.commands.registerCommand("mysql.newQuery", (databaseOrConnectionNode: DatabaseNode | ConnectionNode) => {
        databaseOrConnectionNode.newQuery();
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand("auto.home", () => {
        vscode.window.showInformationMessage('您执行了 auto.home 命令！');
    }));
    context.subscriptions.push(vscode.commands.registerCommand("mysql.selectTop1000", (tableNode: TableNode) => {
        tableNode.selectTop1000();
    }));


    mysqlTreeDataProvider.refresh();

}

export function deactivate() {
    console.log('扩展销毁！');
}
