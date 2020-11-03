import { JavaBeanInfo } from "./javaBeanInfo";

export class ColumnInfo {
    /**
     * 列
     * @param columnName 字段名
     * @param columnType 字段类型
     * @param columnComment 字段注释
     */
    constructor(
        public readonly columnName: string,
        public readonly columnType: string,
        public readonly columnComment: string,
    ) { }
}

export class TableInfo {

    /**
     * 表信息
     * @param tableName  表名
     * @param columnList  列信息
     */
    constructor(
        public readonly tableName: string,
        public readonly columnList: ColumnInfo[]
    ) { }

    public toJavaBean(): JavaBeanInfo {
        let className: string = TableInfo.toHump(this.tableName);
        let propertyList: Array<string> = new Array<string>();
        this.columnList.map(item => {
            propertyList.push(TableInfo.toHump(item.columnName))
        })
        return new JavaBeanInfo(className, propertyList);
    }

    // 下划线转换驼峰
    private static toHump(name: string): string {
        return name.replace(/\_(\w)/g, function (all, letter) {
            return letter.toUpperCase();
        });
    }
    // 驼峰转换下划线
    private static toLine(name: string): string {
        return name.replace(/([A-Z])/g, "_$1").toLowerCase();
    }

}