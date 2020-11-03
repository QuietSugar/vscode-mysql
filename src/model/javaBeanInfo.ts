export class JavaBeanInfo {
    /**
     * 表信息
     * @param tableName  表名
     * @param columnList  列信息
     */
    constructor(
        public readonly tableName: string,
        public readonly propertyList: string[],
    ) { }
}