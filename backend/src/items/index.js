const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const ngeohash = require('ngeohash');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = process.env.ITEMS_TABLE;

const getHeaders = () => ({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
});

module.exports.createItem = async (event) => {
    try {
        const userId = event.requestContext?.authorizer?.jwt?.claims?.sub;
        const body = JSON.parse(event.body);

        if (!body.title || !body.latitude || !body.longitude) {
            return { statusCode: 400, headers: getHeaders(), body: JSON.stringify({ message: 'Missing required fields' }) };
        }

        const id = uuidv4();
        // Create a geohash of length 6 (approx 1.2km x 0.6km precision)
        const geohash = ngeohash.encode(body.latitude, body.longitude, 6);

        const item = {
            id,
            ownerId: userId,
            title: body.title,
            description: body.description,
            category: body.category,
            condition: body.condition,
            images: body.images || [],
            latitude: body.latitude,
            longitude: body.longitude,
            geohash,
            status: 'AVAILABLE',
            createdAt: new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: ITEMS_TABLE,
            Item: item
        });
        await docClient.send(command);

        // Broadcast to WebSocket clients
        try {
            // Require the websocket broadcasting function we created
            const { broadcast } = require('../websockets/index');

            // In a real app we'd pass this as an env param `WS_ENDPOINT`, 
            // but for this AWS demo, assuming the frontend knows the wss:// URL to connect to.
            // Let's rely on an env variable for the HTTP ApiGatewayManagementApi endpoint
            if (process.env.WS_ENDPOINT) {
                await broadcast(item, process.env.WS_ENDPOINT);
                console.log('Broadcasted new item to map via WebSockets');
            } else {
                console.warn('WS_ENDPOINT not provided. Skipping WebSocket broadcast.');
            }
        } catch (wsError) {
            console.error('Failed to broadcast via WS', wsError);
        }

        return { statusCode: 201, headers: getHeaders(), body: JSON.stringify(item) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};

module.exports.getItems = async (event) => {
    try {
        const { lat, lng, radius } = event.queryStringParameters || {};

        let command;
        if (lat && lng) {
            // Simplified nearby logic for demo: query specific geohash
            // In a production app, we would query the geohash neighbors as well
            const targetHash = ngeohash.encode(parseFloat(lat), parseFloat(lng), 6);
            command = new QueryCommand({
                TableName: ITEMS_TABLE,
                IndexName: 'GeohashIndex',
                KeyConditionExpression: 'geohash = :h',
                FilterExpression: '#s = :status',
                ExpressionAttributeNames: { '#s': 'status' },
                ExpressionAttributeValues: { ':h': targetHash, ':status': 'AVAILABLE' }
            });
        } else {
            // Fallback: Scan latest available items (Not recommended for prod scale, but okay for MVP demo)
            command = new ScanCommand({
                TableName: ITEMS_TABLE,
                FilterExpression: '#s = :status',
                ExpressionAttributeNames: { '#s': 'status' },
                ExpressionAttributeValues: { ':status': 'AVAILABLE' },
                Limit: 50
            });
        }

        const { Items } = await docClient.send(command);
        return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(Items) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};

module.exports.getItem = async (event) => {
    try {
        const { id } = event.pathParameters;
        const command = new GetCommand({ TableName: ITEMS_TABLE, Key: { id } });
        const { Item } = await docClient.send(command);

        if (!Item) return { statusCode: 404, headers: getHeaders(), body: JSON.stringify({ message: 'Item not found' }) };

        return { statusCode: 200, headers: getHeaders(), body: JSON.stringify(Item) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, headers: getHeaders(), body: JSON.stringify({ message: 'Internal Server Error' }) };
    }
};
