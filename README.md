MEMERANK - a meme ranking website for uploding and rating diffrent memes online

Features
Landing page — live top 10 leaderboard with meme thumbnails, medals for top 3, and average scores
Rank mode — shows random unrated memes one at a time, rate 1–10, no repeats per session
Upload mode — drag and drop meme upload with optional title

AWS services used:
1.CloudFrontCDN - for global delivery, HTTPS, caching, and DDoS protection
2.API GatewayHTTP -  API that routes requests from the frontend to the correct Lambda function
3.Lambda(x5) - Serverless functions handling all backend logic (Node.js)
4. DynamoDB - for storing meme metadata and user ratings — i choose this for its ability to scale automatically without managing servers
5. S3Hosts - the static frontend (HTML/CSS/JS) and stores uploaded meme images

Lambda Functions:
1.getUploadUrl GET route:/upload-url - Generates a presigned S3 URL for secure direct browser-to-S3 uploads
2.confirmUpload POST route:/confirm-upload - Saves meme metadata to DynamoDB after successful S3 upload
3.getRandomMeme GET route:/meme/random - Returns a random unrated meme for the current session
4.submitRating POST route:/rateRecords -  a rating and updates the meme's score in DynamoDB
5.getScoreboard GET route:/scoreboard - Returns all memes sorted by average rating
