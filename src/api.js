const db = require("./db");
const {
	GetItemCommand,
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

