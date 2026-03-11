import { Attribute as DynamoAttribute, AttributeType as DynamoAttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Key } from 'aws-cdk-lib/aws-kms';
import * as z from 'zod';

// zod types

export const ZodCompartmentId = z.coerce.number();
export const ZodTransitionId = z.coerce.number();
export const ZodProjectId = z.string().nonempty();
export const ZodSimModelId = ZodProjectId;

export const ZodCompartment = z.object({
    id: ZodCompartmentId.readonly(),
    name: z.string().nonempty().readonly(),
    x: z.number().readonly(),
    y: z.number().readonly(),
    transitions: z.array(ZodTransitionId.readonly()).readonly()
});

export const ZodTransition = z.object({
    id: ZodTransitionId.readonly(),
    start: ZodCompartmentId.readonly(),
    end: ZodCompartmentId.readonly(),
});

export const ZodDbSimModel = z.object({
    id: ZodSimModelId.readonly(),
    compartments: z.record(ZodCompartmentId.readonly(), ZodCompartment.readonly()).readonly(),
    transitions: z.record(ZodTransitionId.readonly(), ZodTransition.readonly()).readonly()
});

export const ZodParsedSimModel = ZodDbSimModel.transform(data => ({
    ...data,
    compartments: new Map(
        Object.entries(data.compartments).map(
            ([key, value]) => [ZodCompartmentId.parse(key), value]
        )
    ) as ReadonlyMap<CompartmentId, z.infer<typeof ZodCompartment>>,

    transitions: new Map(
        Object.entries(data.transitions).map(
            ([key, value]) => [ZodTransitionId.parse(key), value]
        )
    ) as ReadonlyMap<TransitionId, z.infer<typeof ZodTransition>>,
}));

export const ZodProject = z.object({
    project_id: z.string().readonly(),
    user_id: z.string().readonly(),
    name: z.string().nonempty().readonly(),
    createdAt: z.string().readonly(),
    lastModifiedAt: z.string().readonly(),
    model: ZodParsedSimModel.readonly()
});

// "normal" types

export type ProjectId = z.infer<typeof ZodProjectId>;
export type SimModelId = z.infer<typeof ZodSimModelId>;
export type TransitionId = z.infer<typeof ZodTransitionId>;
export type CompartmentId = z.infer<typeof ZodCompartmentId>;

export type Project = z.infer<typeof ZodProject>;
export type DbSimModel = z.infer<typeof ZodDbSimModel>;
export type SimModel = z.infer<typeof ZodParsedSimModel>;
export type Compartment = z.infer<typeof ZodCompartment>;
export type Transition = z.infer<typeof ZodTransition>;

// type helpers

export const convertSimModelToDbSimModel = (model: SimModel): DbSimModel => {
    const convertMapToRecord= <K extends number | string, V>(map: ReadonlyMap<K, V>) => {
        const record: Record<number | string, V> = {};
        map.forEach((value, key) => {
            record[key] = value
        });
        return record;
    }

    return {
        ...model,
        compartments: convertMapToRecord(model.compartments),
        transitions: convertMapToRecord(model.transitions),
    };
}

// table information

const PROJECTS_TABLE = {
    externalName: "UserProjects",

    indexes: {
        projectId: {
            name: "ProjectIdIndex",
            partitionKey: { name: "project_id", type: DynamoAttributeType.STRING } as const as DynamoAttribute,
            sortKey: { name: "user_id", type: DynamoAttributeType.STRING } as const as DynamoAttribute
        } as const
    } as const,
    userIdKey: { name: "user_id", type: DynamoAttributeType.STRING } as const as DynamoAttribute,
    projectIdKey: { name: "project_id", type: DynamoAttributeType.STRING } as const as DynamoAttribute
} as const;

export const TABLES = {
    userProjects: PROJECTS_TABLE
} as const;