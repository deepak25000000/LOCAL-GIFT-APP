const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const REQUESTS_TABLE = process.env.REQUESTS_TABLE;
const ITEMS_TABLE = process.env.ITEMS_TABLE;

const getHeaders = () => ({ 'Access-Control-Allow-Origin': '*' });

module.exports.createRequest = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
        const body = JSON.parse(event.body);

        if (!body.itemId || !body.ownerId) {
            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: 'Missing itemId or ownerId' }) };
        }

        const id = uuidv4();
        const request = {
            id,
            itemId: body.itemId,
            requesterId: userId,
            ownerId: body.ownerId,
            message: body.message || '',
            status: 'PENDING',
            createdAt: new Date().toISOString()
        };

        await docClient.send(new PutCommand({ TableName: REQUESTS_TABLE, Item: request }));

        // NOTE: In full production, we would publish to an SNS topic here to notify the owner
        // const snsClient = new SNSClient({});
        // await snsClient.send(new PublishCommand({ TopicArn: process.env.NOTIFICATIONS_TOPIC, Message: ... }));

        return { statusCode: 201, headers: getHeaders(), body: JSON.stringify(request) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};

module.exports.getRequests = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;

        // As an owner, fetch requests made to my items
        const command = new QueryCommand({
            TableName: REQUESTS_TABLE,
            IndexName: 'OwnerRequestsIndex',
            KeyConditionExpression: 'ownerId = :o',
            ExpressionAttributeValues: { ':o': userId }
        });

        const { Items } = await docClient.send(command);
        return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(Items) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};

module.exports.updateRequest = async (event) => {
    try {
        const { id } = event.pathParameters;
        const body = JSON.parse(event.body);
        const { status } = body; // 'ACCEPTED' or 'REJECTED'

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: 'Invalid status' }) };
        }

        const command = new UpdateCommand({
            TableName: REQUESTS_TABLE,
            Key: { id },
            UpdateExpression: 'set #s = :status',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':status': status },
            ReturnValues: 'ALL_NEW'
        });

        const { Attributes } = await docClient.send(command);
        return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(Attributes) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};
