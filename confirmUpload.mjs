import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const TABLE = "meme-MR";

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { memeId, s3Key, fileName } = body;

  await dynamo.send(new PutItemCommand({
    TableName: TABLE,
    Item: {
      memeid:       { S: memeId },
      s3Key:        { S: s3Key },
      fileName:     { S: fileName || "untitled" },
      totalRatings: { N: "0" },
      ratingSum:    { N: "0" },
      uploadedAt:   { S: new Date().toISOString() },
    }
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, memeId }),
  };
};
