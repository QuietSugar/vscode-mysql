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
}

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
