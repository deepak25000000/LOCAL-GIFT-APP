const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;

module.exports.connect = async (event) => {
    const connectionId = event.requestContext.connectionId;

    try {
        await docClient.send(new PutCommand({
            TableName: CONNECTIONS_TABLE,
            Item: {
                connectionId: connectionId,
                timestamp: Date.now()
            }
        }));
        return { statusCode: 200, body: 'Connected.' };
    } catch (err) {
        console.error("Failed to connect: " + err);
        return { statusCode: 500, body: 'Failed to connect: ' + err };
    }
};

module.exports.disconnect = async (event) => {
    const connectionId = event.requestContext.connectionId;

    try {
        await docClient.send(new DeleteCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId }
        }));
        return { statusCode: 200, body: 'Disconnected.' };
    } catch (err) {
        console.error("Failed to disconnect: " + err);
        return { statusCode: 500, body: 'Failed to disconnect: ' + err };
    }
};

module.exports.broadcast = async (item, apiGatewayEndpoint) => {
    const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');

    const apigwManagementApi = new ApiGatewayManagementApiClient({
        endpoint: apiGatewayEndpoint
    });

    try {
        const connectionData = await docClient.send(new ScanCommand({
            TableName: CONNECTIONS_TABLE,
            ProjectionExpression: 'connectionId'
        }));

        const postCalls = connectionData.Items.map(async ({ connectionId }) => {
            try {
                await apigwManagementApi.send(new PostToConnectionCommand({
                    ConnectionId: connectionId,
                    Data: JSON.stringify({ action: 'newItem', item })
                }));
            } catch (e) {
                if (e.statusCode === 410) {
                    console.log(`Found stale connection, deleting ${connectionId}`);
                    await docClient.send(new DeleteCommand({ TableName: CONNECTIONS_TABLE, Key: { connectionId } }));
                } else {
                    throw e;
                }
            }
        });

        await Promise.all(postCalls);
    } catch (err) {
        console.error("Broadcast failed:", err);
    }
};
