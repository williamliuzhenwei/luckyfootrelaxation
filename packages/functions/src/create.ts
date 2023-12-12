import * as uuid from "uuid";
import { Table } from "sst/node/table";
import handler from "@notes/core/handler";
import dynamoDb from "@notes/core/dynamodb";

export const main = handler(async (event) => {
  let data = {
    employeeName: "",
    workType: "",
    workTime: "",
    paymentMethod: "",
    paymentAmount: 0,
    tipMethod: "",
    tipAmount: 0,
  };

  if (event.body != null) {
    data = JSON.parse(event.body);
  }

  const params = {
    TableName: Table.Schedules.tableName,
    Item: {
      userId: event.requestContext.authorizer?.iam.cognitoIdentity.identityId,
      scheduleId: uuid.v1(),
      employeeName: data.employeeName,
      workType: data.workType,
      workTime: data.workTime,
      paymentMethod: data.paymentMethod,
      paymentAmount: data.paymentAmount,
      tipMethod: data.tipMethod,
      tipAmount: data.tipAmount,
      createdAt: Date.now(),
    },
  };

  await dynamoDb.put(params);

  return JSON.stringify(params.Item);
});