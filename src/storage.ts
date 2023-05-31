import { TableServiceClient, TableClient } from "@azure/data-tables";
import { Configs } from "./config";
const tableService = TableServiceClient.fromConnectionString(
  Configs.connectionString
);

export async function createTable(tableName: string): Promise<TableClient> {
  await tableService.createTable(tableName);
  return TableClient.fromConnectionString(Configs.connectionString, tableName);
}

export async function insertOrReplace(value: string, rowKey: string) {
  const entity = {
    partitionKey: "duck",
    rowKey: rowKey,
    name: value,
  };
  const tableClient = await createTable(Configs.tableName);
  try {
    await tableClient.createEntity(entity);
  } catch (e) {
    if (e.response.status !== 409) {
      console.log(e);
      return;
    }
    await tableClient.updateEntity(entity, "Replace");
  }
  return;
}

export async function getDuck(channelId: string): Promise<string> {
  const tableClient = await createTable(Configs.tableName);
  try {
    const entityRes = await tableClient.getEntity("duck", channelId);
    const duck = entityRes.name as string;
    return duck;
  } catch (e) {
    if (e.response.status !== 404) {
      console.log(e);
    }
  }
  return "";
}
