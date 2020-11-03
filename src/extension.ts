"use strict";
import * as vscode from "vscode";

import { HttpUtil } from "./common/httpUtils";
 

import { WelcomeWebView } from "./pages/welcome";
import { DatabaseService } from "./service/databaseService";
import { Example } from "./pages/example";
import { Logger } from './common/logger';
import { TemplateService } from "./service/templateService";
const logger = Logger.instance;

export function activate(context: vscode.ExtensionContext) {
    logger.debug('扩展激活！');
    HttpUtil.get("http://trace-test.bangbangas.com/backend2/index/info");

    let databaseService = new DatabaseService(context);
    let templateService: TemplateService = new TemplateService(context);
    databaseService.init();
    templateService.init();
 
    WelcomeWebView.init(context);

    const example = new Example();

    context.subscriptions.push(vscode.commands.registerCommand("auto.home", () => {
        vscode.window.showInformationMessage('您执行了 auto.home 命令！');
    }));


}

export function deactivate() {
    logger.debug('扩展销毁！');
}
