const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client();

module.exports.getPresignedUrl = async (event) => {
    try {
        const { filename, contentType } = event.queryStringParameters || {};

        if (!filename || !contentType) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Missing filename or contentType' })
            };
        }

        const fileExtension = filename.split('.').pop();
        const uniqueFileName = `${uuidv4()}.${fileExtension}`;

        // The user's Cognito ID from JWT Authorizer (API Gateway automatically parses JWT)
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub || 'anonymous';
        const s3Key = `users/${userId}/items/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: process.env.UPLOADS_BUCKET,
            Key: s3Key,
            ContentType: contentType
        });

        // URL expires in 5 minutes (300 seconds)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                uploadUrl,
                fileUrl: `https://${process.env.UPLOADS_BUCKET}.s3.amazonaws.com/${s3Key}`
            })
        };
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
};
