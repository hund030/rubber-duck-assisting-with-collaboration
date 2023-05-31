export class Configs {
    static readonly connectionString = process.env["TABLE_STORAGE"];
    static readonly tableName = process.env["TABLE_NAME"];
}