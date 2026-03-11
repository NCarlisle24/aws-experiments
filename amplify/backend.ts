import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { AttributeType as DynamoAttributeType, Table as DynamoTable, TableV2 as DynamoTableV2 } from "aws-cdk-lib/aws-dynamodb";

import { TABLES } from './data/tables';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
    auth,
});

const customStack = backend.createStack("CustomStackForExternalResources");

// schema defined in "new TableV2(...)" below
// "By default, TableV2 will create a single table in the main deployment region referred to as the primary table"
// - https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb-readme.html

const projectsTableInfo = TABLES.userProjects;
const projectsTableName = projectsTableInfo.externalName;

const projectIdIndex = projectsTableInfo.indexes.projectId;
const userIdKey = projectsTableInfo.userIdKey;
const projectIdKey = projectsTableInfo.projectIdKey;

export const userProjectsTable = new DynamoTableV2(
    customStack, // specifies the cloud formation stack info, i.e. which region to deploy in
    projectsTableName, // name of the table
    {
        partitionKey: userIdKey,
        sortKey: projectIdKey, // because sort key exists, it acts as the unique identifier here
        globalSecondaryIndexes: [
            {
                indexName: projectIdIndex.name,
                partitionKey: projectIdIndex.partitionKey,
                sortKey: projectIdIndex.sortKey
            }
        ]
    }

    // optionally, can also include secondary indices. A globalSecondaryIndex queries on all data
    // in the base table + all partitions.  A localSecondaryIndex queries only on data within one partition at a time.
    
    // In dynamo, the primary key is either a "partition key", or a partition key in conjunciton with a "sort key".

    // In the first version, no two items in a table can have the same partition key (normal PK).

    // In the second version, two items in a table can have the same partition key, but the sort key determines
    // which item is returned when querying a given partition key. No two items in the same partition can have
    // the same sort key.

    // Global secondary indices have a partition key and may optionally include a sort key. 
    // Local secondary indices have the same partition key as the base table, and must specify a unique sort key.

    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html
);

const authenticatedUserRole = backend.auth.resources.authenticatedUserIamRole;

authenticatedUserRole.addToPrincipalPolicy(new PolicyStatement({
    actions: [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:DeleteItem"
    ],
    resources: [
        userProjectsTable.tableArn,             // grant permission to use base table
        `${userProjectsTable.tableArn}/index/*` // grant permission to use all indexes
    ],
}));

backend.addOutput({
    custom: {
        userProjectsTableName: userProjectsTable.tableName
    }
})