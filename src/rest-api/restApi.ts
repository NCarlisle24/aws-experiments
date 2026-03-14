import { AuthContextData } from '../auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';
import { v4 as uuid } from 'uuid';
import * as z from "zod";

import { TABLES, ZodDbModel, type DbModel, type ModelId, 
         userIdKeyName, modelIdKeyName} from '../../amplify/data/tables';
import { type Model, ModelLib } from '../model-creator';

import outputs from '../../amplify_outputs.json';

const MODELS_TABLE_NAME = outputs.custom.userModelsTableName;

// TODO: cache the client instead of recreating it every request
const createClient = async () => {
    const { credentials } = await fetchAuthSession();

    if (!credentials) throw new Error("AWS credentials not found. Please make sure you're logged in.");

    const client = new DynamoDBClient({
        region: "us-west-2",
        credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
        }
    });

    return DynamoDBDocumentClient.from(client);
}

const restApi = (() => {
    const getUserModel = async (authContextData: AuthContextData, modelId: string): Promise<Model | null> => {
        if (!authContextData.isLoggedIn()) {
            return null;
        }

        const client = await createClient();
        const userId = authContextData.getUserId();

        const modelsTableInfo = TABLES.userModels;

        const command = new GetCommand({
            TableName: MODELS_TABLE_NAME,
            Key: {
                [modelsTableInfo.modelIdKey.name]: modelId,
                [modelsTableInfo.userIdKey.name]: userId
            }
        });

        try {
            const dbModel = ZodDbModel.parse((await client.send(command)).Item);
            return ModelLib.convertFromDbModel(dbModel);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Fetched models are not valid:", error);
            } else {
                console.error("Error while validating user model:", error);
            }

            return null;
        }
    }

    const getUserModels = async (authContextData: AuthContextData): Promise<Model[] | null> => {
        if (!authContextData.isLoggedIn()) {
            return null;
        }

        const client = await createClient();
        const userId = authContextData.getUserId();
        const modelsTableInfo = TABLES.userModels;
        const modelsTableUserIdName = modelsTableInfo.userIdKey.name;

        const command = new QueryCommand({
            TableName: MODELS_TABLE_NAME,
            KeyConditionExpression: modelsTableUserIdName + " = :u",
            ExpressionAttributeValues: {
                ":u": userId
            }
        });

        try {
            const dbModels = await client.send(command);
            const parsedModels = z.array(ZodDbModel).parse(dbModels.Items ?? []);
            return parsedModels.map(dbModel => ModelLib.convertFromDbModel(dbModel));
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Fetched models are not valid:", error);
            } else {
                console.error("Error while fetching user models:", error);
            }

            return null;
        }
    }

    const createUserModel = async (authContextData: AuthContextData, model?: Model) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();
        
        let newModel: DbModel;

        if (model) {
            newModel = ModelLib.convertToDbModel(model);
        } else {
            const modelId = uuid(); // creates a randomized ID
            const timeCreated = new Date().toString();

            newModel = {
                // required attributes (must match backend config)

                [modelIdKeyName]: modelId,
                [userIdKeyName]: authContextData.getUserId(),

                // other attributes

                compartments: [],
                transitions: [],
                modelName: "Untitled model",
                createdAt: timeCreated,
                lastModifiedAt: timeCreated,
            };
        }

        try {
            const command = new PutCommand({
                TableName: MODELS_TABLE_NAME,
                Item: ZodDbModel.parse(newModel)
            });

            await client.send(command);
            return newModel.id;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Created model does not match interface:", error);
            } else {
                console.error("Error while uploading model:", error);
            }

            return "";
        }
    }

    const deleteUserModel = async (authContextData: AuthContextData, modelId: ModelId) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();

        const modelsTableInfo = TABLES.userModels;

        const command = new DeleteCommand({
            TableName: MODELS_TABLE_NAME,
            Key: {
                [modelsTableInfo.modelIdKey.name]: modelId,
                [modelsTableInfo.userIdKey.name]: authContextData.getUserId(),
            }
        });

        try {
            return await client.send(command);
        } catch (e) {
            console.error("Error occurred while deleting model:", e);
        }
    }

    const updateUserModel = async (authContextData: AuthContextData, model: Model) => {
        if (!authContextData.isLoggedIn()) return;

        const timeModified = new Date().toString();

        // TODO: update only select parts of the model rather than re-uploading the whole thing

        try {
            await deleteUserModel(authContextData, model.id);
            await createUserModel(authContextData, { ...model, lastModifiedAt: timeModified });
        } catch (error) {
            console.error("Error occurred while updating model:", error);
        }
    }

    const setUserModelName = async (authContextData: AuthContextData, modelId: ModelId, newName: Model["modelName"]) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();
        const modelsTableInfo = TABLES.userModels;
        const timeModified = new Date().toString();

        try {
            const command = new UpdateCommand({
                TableName: MODELS_TABLE_NAME,
                Key: {
                    [modelsTableInfo.modelIdKey.name]: modelId,
                    [modelsTableInfo.userIdKey.name]: authContextData.getUserId()
                },
                UpdateExpression: "set modelName = :newName, lastModifiedAt = :lastModifiedAt",
                ExpressionAttributeValues: {
                    ":newName": newName,
                    ":lastModifiedAt": timeModified
                },
            });

            await client.send(command);

        } catch (error) {
            console.error("Error occurred while changed model name:", error);
        }
    }

    return {
        getUserModel,
        getUserModels,
        createUserModel,
        deleteUserModel,
        updateUserModel,
        setUserModelName
    };
})();

export default restApi;