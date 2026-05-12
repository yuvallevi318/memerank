import { DynamoDBClient, UpdateItemCommand, PutItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const MEMES_TABLE = "meme-MR";
const SESSIONS_TABLE = "sessions-MR";

export const handler = async (event) => {
  const body = JSON.parse(event.body);
  const { memeId, rating, sessionId } = body;

  if (!memeId || !rating || !sessionId) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "memeId, rating and sessionId required" }),
    };
  }

  const existing = await dynamo.send(new GetItemCommand({
    TableName: SESSIONS_TABLE,
    Key: {
      sessionsid: { S: sessionId },
      memeid:     { S: memeId },
    }
  }));

  if (existing.Item) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Already rated" }),
    };
  }

  await dynamo.send(new UpdateItemCommand({
    TableName: MEMES_TABLE,
    Key: { memeid: { S: memeId } },
    UpdateExpression: "SET totalRatings = totalRatings + :one, ratingSum = ratingSum + :r",
    ExpressionAttributeValues: {
      ":one": { N: "1" },
      ":r":   { N: String(rating) },
    }
  }));

  await dynamo.send(new PutItemCommand({
    TableName: SESSIONS_TABLE,
    Item: {
      sessionsid: { S: sessionId },
      memeid:     { S: memeId },
      ratedAt:    { S: new Date().toISOString() },
    }
  }));

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ success: true }),
  };
};
