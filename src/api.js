const db = require("./db");
const {
	GetItemCommand,
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getOneVisitor = async (event) => {
	const response = { statusCode: 200 };

	try {
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ visitorId: Number(event.pathParameters.visitorId) }),
		}
		const { Item } = await db.send(new GetItemCommand(params));
		console.log({ Item });
		response.body = JSON.stringify({
			message: "Successfully retrieved visitor",
			data: (Item) ? unmarshall(Item) : {},
		});
	} catch (e) {
		console.error(e);
		response.statusCode = 500;
		response.body = JSON.stringify({
			message: "Failed to get visitor",
			errorMessage: e.message,
			errorStack: e.stack,
		});
	}
	return response;
};
const getAllVisitors = async (event) => {
	const response = { statusCode: 200 };

	try {
		const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));
		response.body = JSON.stringify({
			message: "Successfully retrieved all visitors",
			data: Items.map((item) => unmarshall(item)),
			Items,
		});
	} catch (e) {
		console.error(e);
		response.statusCode = 500;
		response.body = JSON.stringify({
			message: "Failed to get visitors",
			errorMessage: e.message,
			errorStack: e.stack,
		});
	}
	return response;
};
const addVisitor = async (event) => {
	const response = { statusCode: 200 };

	try {
		const body = JSON.parse(event.body);
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Item: marshall(body),
		}
		const addResult = await db.send(new PutItemCommand(params));
		response.body = JSON.stringify({
			message: "Successfully added visitor",
			addResult,
		});
	} catch (e) {
		console.error(e);
		response.statusCode = 500;
		response.body = JSON.stringify({
			message: "Failed to add visitor",
			errorMessage: e.message,
			errorStack: e.stack,
		});
	}
	return response;
};
const updateVisitor = async (event) => {
	const response = { statusCode: 200 };

	try {
		const body = JSON.parse(event.body);
		const objKeys = Object.keys(body)
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Key: marshall({ visitorId: event.pathParameters.visitorId }),
			// Specific to DynamoDB update expression
			UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
		}
		const updateResult = await db.send(new UpdateItemCommand(params));
		response.body = JSON.stringify({
			message: "Successfully updated visitor",
			updateResult,
		});
	} catch (e) {
		console.error(e);
		response.statusCode = 500;
		response.body = JSON.stringify({
			message: "Failed to update visitor",
			errorMessage: e.message,
			errorStack: e.stack,
		});
	}
	return response;
};
const removeVisitor = async (event) => {
	const response = { statusCode: 200 };

	try {
		const params = {
			TableName: process.env.DYNAMODB_TABLE_NAME,
			Item: marshall({ visitorId: event.pathParameters.visitorId }),
		}
		const deleteResult = await db.send(new DeleteItemCommand(params));
		response.body = JSON.stringify({
			message: "Successfully removed visitor",
			deleteResult,
		});
	} catch (e) {
		console.error(e);
		response.statusCode = 500;
		response.body = JSON.stringify({
			message: "Failed to remove visitor",
			errorMessage: e.message,
			errorStack: e.stack,
		});
	}
	return response;
};

module.exports = {
	getOneVisitor,
	getAllVisitors,
	addVisitor,
	updateVisitor,
	removeVisitor,
};