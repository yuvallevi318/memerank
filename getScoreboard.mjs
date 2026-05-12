import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const dynamo = new DynamoDBClient({ region: "us-east-1" });
const MEMES_TABLE = "meme-MR";

export const handler = async () => {
  const result = await dynamo.send(new ScanCommand({ TableName: MEMES_TABLE }));

  const memes = result.Items
    .filter(m => Number(m.totalRatings.N) > 0)
    .map(m => ({
      memeId:       m.memeid.S,
      fileName:     m.fileName.S,
      s3Key:        m.s3Key.S,
      averageScore: m.ratingSum && m.totalRatings
        ? parseFloat((Number(m.ratingSum.N) / Number(m.totalRatings.N)).toFixed(1))
        : 0,
      totalRatings: Number(m.totalRatings.N),
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ memes }),
  };
};
