import * as AWS from 'aws-sdk';
import { isEmpty } from '../util/GeneralUtil';
const uuidv4 = require('uuid/v4');

const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-northeast-2' });

const table = "plgr-plugin";

class PluginDbAgent {
    async createPlugin(event: any): Promise<any> {
        try {
            const item = JSON.parse(event.body);
            let params = {
                TableName: table,
                Item: {
                    "plugin_id": uuidv4(),
                    "authorId": item.authorId,
                    "htmlSource": item.htmlSource,
                    "jsSource": item.jsSource,
                    "manifest": item.manifest,
                }
            }
            const result = await docClient.put(params).promise();

            return {
                resultCode: 0,
                resultMessage: 'createPlugin 성공',
                data: result
            };
        }
        catch (err) {
            return { resultCode: 99, resultMessage: err };
        }
    }

    async getPlugin(event: any): Promise<any> {
        try {
            let params = {
                TableName: table,
                Key: {
                    plugin_id: event.pathParameters.id,
                }
            }
            const result = await docClient.get(params).promise();

            if (isEmpty(result)) {
                return {
                    resultCode: 1,
                    resultMessage: '존재하지 않는 플러그인입니다.'
                }
            } else {
                return {
                    resultCode: 0,
                    resultMessage: 'success',
                    data: result
                };
            }
        }
        catch (err) {
            return { resultCode: 99, test: event.pathParameters.id, resultMessage: err };
        }
    }

    async getAllPlugin(event: any): Promise<any> {
        try {
            let params = {
                TableName: table,
                ProjectionExpression: "plugin_id,manifest"
            }
            const result = await docClient.scan(params).promise();

            if (isEmpty(result)) {
                return {
                    resultCode: 1,
                    resultMessage: 'failed'
                }
            } else {
                return {
                    resultCode: 0,
                    resultMessage: 'success',
                    data: result
                };
            }
        }
        catch (err) {
            return { resultCode: 99, test: event.pathParameters.id, resultMessage: err };
        }
    }

    async deletePlugin(event: any): Promise<any> {
        try {
            const item = JSON.parse(event.body);
            const { plugin_id } = item;
            let params = {
                TableName: table,
                Key: {
                    "plugin_id": plugin_id,
                }
            }
            const result = await docClient.delete(params).promise();

            return {
                resultCode: 0,
                resultMessage: 'deletePlugin 성공',
                data: result
            };
        }
        catch (err) {
            return { resultCode: 99, resultMessage: err };
        }
    }
    async updatePlugin(event: any): Promise<any> {
        try {
            const item = JSON.parse(event.body);
            const { plugin_id } = item;
            let params = {
                TableName: table,
                Key: {
                    "plugin_id": plugin_id,
                },
                UpdateExpression: "set name = :n, authorId = :a, description = :d, index_html = :h, index_js = :j, manifest = :m",
                ExpressionAttributeValues: {
                    ':n': item.name,
                    ':a': item.authorId,
                    ':d': item.description,
                    ':h': item.index_html,
                    ':j': item.index_js,
                    ':m': item.manifest
                },
                ReturnValues: "UPDATED_NEW"
            }
            const result = await docClient.update(params).promise();

            return {
                resultCode: 0,
                resultMessage: 'updatePlugin 성공',
                data: result
            };
        }
        catch (err) {
            return { resultCode: 99, resultMessage: err };
        }
    }

}

export default new PluginDbAgent();
