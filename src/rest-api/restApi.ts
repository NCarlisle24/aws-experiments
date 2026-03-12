import { AuthContextData } from '../auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { fetchAuthSession } from 'aws-amplify/auth';
import { v4 as uuid } from 'uuid';
import * as z from "zod";

import { TABLES, ZodProject, type Project, type ProjectId, type SimModel,
         ZodDbSimModel, convertSimModelToDbSimModel } from '../../amplify/data/tables';

import outputs from '../../amplify_outputs.json';
import { SimModelLib } from '../sim-creator/system';

const PROJECTS_TABLE_NAME = outputs.custom.userProjectsTableName;

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
    const getUserProject = async (authContextData: AuthContextData, projectId: string) => {
        if (!authContextData.isLoggedIn()) {
            return null;
        }

        const client = await createClient();
        const userId = authContextData.getUserId();

        const projectsTableInfo = TABLES.userProjects;

        const command = new GetCommand({
            TableName: PROJECTS_TABLE_NAME,
            Key: {
                [projectsTableInfo.projectIdKey.name]: projectId,
                [projectsTableInfo.userIdKey.name]: userId
            }
        });

        try {
            const project = (await client.send(command)).Item;
            return ZodProject.parse(project);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Fetched projects is not valid:", error);
            } else {
                console.error("Error while validating user project:", error);
            }

            return null;
        }
    }

    const getUserProjects = async (authContextData: AuthContextData): Promise<Project[] | null> => {
        if (!authContextData.isLoggedIn()) {
            return null;
        }

        const client = await createClient();
        const userId = authContextData.getUserId();
        const projectsTableInfo = TABLES.userProjects;
        const projectsTableUserIdName = projectsTableInfo.userIdKey.name;

        const command = new QueryCommand({
            TableName: PROJECTS_TABLE_NAME,
            KeyConditionExpression: projectsTableUserIdName + " = :u",
            ExpressionAttributeValues: {
                ":u": userId
            }
        });

        try {
            const projects = await client.send(command);
            return z.array(ZodProject).parse(projects.Items ?? []);
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Fetched projects are not valid:", error);
            } else {
                console.error("Error while fetching user projects:", error);
            }

            return null;
        }
    }

    const createUserProject = async (authContextData: AuthContextData) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();
        const projectId = uuid();

        const projectsTableInfo = TABLES.userProjects;

        const timeCreated = new Date().toString();

        const newProject = {

            // required attributes (must match backend config)

            [projectsTableInfo.projectIdKey.name]: projectId,
            [projectsTableInfo.userIdKey.name]: authContextData.getUserId(),

            // other attributes

            projectName: "Untitled project",
            createdAt: timeCreated,
            lastModifiedAt: timeCreated,
            model: ZodDbSimModel.parse(convertSimModelToDbSimModel(SimModelLib.create(projectId)))
        };

        try {
            const command = new PutCommand({
                TableName: PROJECTS_TABLE_NAME,
                Item: ZodProject.parse(newProject)
            });

            await client.send(command);
            return projectId;
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("Created project does not match interface:", error);
            } else {
                console.error("Error while uploading project:", error);
            }

            return "";
        }
    }

    const deleteUserProject = async (authContextData: AuthContextData, projectId: ProjectId) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();

        const projectsTableInfo = TABLES.userProjects;

        const command = new DeleteCommand({
            TableName: PROJECTS_TABLE_NAME,
            Key: {
                [projectsTableInfo.projectIdKey.name]: projectId,
                [projectsTableInfo.userIdKey.name]: authContextData.getUserId(),
            }
        });

        try {
            return await client.send(command);
        } catch (e) {
            console.error("Error occurred while deleting project:", e);
        }
    }

    const setProjectModel = async (authContextData: AuthContextData, projectId: ProjectId, newModel: SimModel) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();
        const newDbModel = convertSimModelToDbSimModel(newModel);

        const projectsTableInfo = TABLES.userProjects;
        const timeModified = new Date().toString();

        try {
            const command = new UpdateCommand({
                TableName: PROJECTS_TABLE_NAME,
                Key: {
                    [projectsTableInfo.projectIdKey.name]: projectId,
                    [projectsTableInfo.userIdKey.name]: authContextData.getUserId()
                },
                UpdateExpression: "set model = :model, lastModifiedAt = :lastModified",
                ExpressionAttributeValues: {
                    ":model": ZodDbSimModel.parse(newDbModel),
                    ":lastModified": timeModified
                },
            });

            await client.send(command);

        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error("New model is invalid:", error);
            } else {
                console.error("Error occurred while setting project model:", error);
            }
        }
    }

    const setProjectName = async (authContextData: AuthContextData, projectId: ProjectId, newName: Project["projectName"]) => {
        if (!authContextData.isLoggedIn()) return;

        const client = await createClient();
        const projectsTableInfo = TABLES.userProjects;
        const timeModified = new Date().toString();

        try {
            const command = new UpdateCommand({
                TableName: PROJECTS_TABLE_NAME,
                Key: {
                    [projectsTableInfo.projectIdKey.name]: projectId,
                    [projectsTableInfo.userIdKey.name]: authContextData.getUserId()
                },
                UpdateExpression: "set projectName = :newName, lastModifiedAt = :lastModified",
                ExpressionAttributeValues: {
                    ":newName": newName,
                    ":lastModified": timeModified
                },
            });

            await client.send(command);

        } catch (error) {
            console.error("Error occurred while changed project name:", error);
        }
    }

    return {
        getUserProjects,
        getUserProject,
        createUserProject,
        deleteUserProject,
        setProjectModel,
        setProjectName
    };
})();

export default restApi;