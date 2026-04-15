const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;

const getHeaders = () => ({ 'Access-Control-Allow-Origin': '*' });

module.exports.sendMessage = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
        const body = JSON.parse(event.body);

        if (!body.conversationId || !body.text) {
            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: 'Missing conversationId or text' }) };
        }

        const message = {
            id: uuidv4(),
            conversationId: body.conversationId,
            senderId: userId,
            text: body.text,
            timestamp: new Date().toISOString()
        };

        await docClient.send(new PutCommand({ TableName: MESSAGES_TABLE, Item: message }));

        return { statusCode: 201, headers: getHeaders(), body: JSON.stringify(message) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};

module.exports.getMessages = async (event) => {
    try {
        const { conversationId } = event.pathParameters;

        const command = new QueryCommand({
            TableName: MESSAGES_TABLE,
            KeyConditionExpression: 'conversationId = :c',
            ExpressionAttributeValues: { ':c': conversationId },
            ScanIndexForward: true // Sort ascending by timestamp (range key)
        });

        const { Items } = await docClient.send(command);
        return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(Items) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};
