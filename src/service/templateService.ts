import * as vscode from "vscode";
import * as uuidv1 from "uuid/v1";

import { Constants } from "../common/constants";

import { ITemplate } from "../model/template";
import { Logger } from '../common/logger';
const logger = Logger.instance;
// 主要功能页
export class TemplateService {
    private context: vscode.ExtensionContext

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    };

    public init() {
        this.context.subscriptions.push(vscode.commands.registerCommand("database.addTemplate", () => {
            // 通过命令行添加模板
            this.addTemplateByCommand();
        }));

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
}