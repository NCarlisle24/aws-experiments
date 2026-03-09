import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { AttributeType, Table, TableV2 } from "aws-cdk-lib/aws-dynamodb";

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

export const userProjectsTable = new TableV2(
    customStack, // specifies the cloud formation stack info (i think?), i.e. which region to deploy in
    "UserProjects",
    {
        partitionKey: { name: "project_id", type: AttributeType.STRING }, // basically the primary key
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