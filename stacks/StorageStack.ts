import { Bucket, StackContext, Table } from "sst/constructs";

export function StorageStack({ stack }: StackContext) {

  // Create an S3 bucket
  const bucket = new Bucket(stack, "Uploads", {
    cors: [
      {
        maxAge: "1 day",
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      },
    ],
  });

  // Create the DynamoDB table for schedules
  const scheduleTable = new Table(stack, "Schedules", {
    fields: {
      userId: "string",
      scheduleId: "string",
      employeeName: "string",
      workType: "string",
      workTime: "string",
      paymentMethod: "string",
      paymentAmount: "number",
      tipMethod: "string",
      tipAmount: "number",
      createdAt: "number",
    },
    primaryIndex: { partitionKey: "userId", sortKey: "scheduleId" },
  });

  return {
    bucket,
    scheduleTable,  // Update to the new table name
  };
}
