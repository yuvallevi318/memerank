import { DynamoDBClient, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const MEMES_TABLE = "meme-MR";
const SESSIONS_TABLE = "sessions-MR";

export const handler = async (event) => {
  const sessionId = event.queryStringParameters?.sessionId;

  if (!sessionId) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "sessionId required" }),
    };
  }

  const allMemes = await dynamo.send(new ScanCommand({ TableName: MEMES_TABLE }));

  const rated = await dynamo.send(new QueryCommand({
    TableName: SESSIONS_TABLE,
    KeyConditionExpression: "sessionsid = :sid",
    ExpressionAttributeValues: { ":sid": { S: sessionId } },
  }));

  const ratedIds = new Set(rated.Items.filter(i => i.memeid).map(i => i.memeid.S));

  const unrated = allMemes.Items.filter(m => !ratedIds.has(m.memeid.S));

  if (unrated.length === 0) {
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ done: true, message: "You rated everything!" }),
    };
  }

  const meme = unrated[Math.floor(Math.random() * unrated.length)];

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      memeId:       meme.memeid.S,
      s3Key:        meme.s3Key.S,
      fileName:     meme.fileName.S,
      totalRatings: Number(meme.totalRatings.N),
    }),
  };
};
