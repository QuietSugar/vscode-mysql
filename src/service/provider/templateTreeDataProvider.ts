import * as path from "path";
import * as uuidv1 from "uuid/v1";
import * as vscode from "vscode";
import * as fs from "fs";
import { IConnection } from "../../model/connection";
import { ConnectionNode } from "../../model/connectionNode";
import { INode } from "../../model/INode";
import { Logger } from '../../common/logger';
const logger = Logger.instance;

export class TemplateTreeDataProvider implements vscode.TreeDataProvider<INode> {
    public _onDidChangeTreeData: vscode.EventEmitter<INode> = new vscode.EventEmitter<INode>();
    public readonly onDidChangeTreeData: vscode.Event<INode> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {
    }

    public getTreeItem(element: INode): Promise<vscode.TreeItem> | vscode.TreeItem {
        return element.getTreeItem();
    }

    public getChildren(element?: INode): Thenable<INode[]> | INode[] {
        if (!element) {
            return this.getConnectionNodes();
        }

        return element.getChildren();
    }


    public refresh(element?: INode): void {
        this._onDidChangeTreeData.fire(element);
    }

    private async getConnectionNodes(): Promise<INode[]> {
        let path = this.context.storagePath + "/template/";
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) {
                    logger.error(err);
                    reject("Error: " + err.message);
                }
                const vmFileNodes = [];
                files.map(item => {
                    logger.error("文件名: {}", item);
                    vmFileNodes.push(item);
                })
                resolve(vmFileNodes);
            });
        });
    }
}
