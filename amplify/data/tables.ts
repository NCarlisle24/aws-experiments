import { type Attribute as DynamoAttribute, AttributeType as DynamoAttributeType } from 'aws-cdk-lib/aws-dynamodb';
import * as z from 'zod';

// table information

export const modelIdKeyName = "id";
export const userIdKeyName = "user_id"

const MODELS_TABLE = {
    externalName: "UserModel",
    indexes: {
        modelId: {
            name: "ModelIdIndex",
            partitionKey: { name: modelIdKeyName, type: DynamoAttributeType.STRING } as const as DynamoAttribute,
            sortKey: { name: userIdKeyName, type: DynamoAttributeType.STRING } as const as DynamoAttribute
        } as const
    } as const,
    userIdKey: { name: userIdKeyName, type: DynamoAttributeType.STRING } as const as DynamoAttribute,
    modelIdKey: { name: modelIdKeyName, type: DynamoAttributeType.STRING } as const as DynamoAttribute
} as const;

export const TABLES = {
    userModels: MODELS_TABLE
} as const;

// zod types

export const ZodCompartmentId = z.coerce.number();
export const ZodTransitionId = z.coerce.number();
export const ZodModelId = z.string().nonempty();

export const ZodDbCompartment = z.object({
    id:             ZodCompartmentId.readonly(),
    name:           z.string().nonempty().readonly(),
    x:              z.number().readonly(),
    y:              z.number().readonly(),
    outTransitions: z.array(ZodTransitionId.readonly()),
    inTransitions:  z.array(ZodTransitionId.readonly()),
});

export const ZodDbTransition = z.object({
    id:     ZodTransitionId.readonly(),
    start:  ZodCompartmentId.readonly(),
    end:    ZodCompartmentId.readonly(),
    weight: z.string()
});

export const ZodDbModelParameter = z.object({
    name:    z.string().nonempty().readonly(),
    type:    z.string().nonempty().readonly(),
    shape:   z.string().nonempty().readonly(),
    comment: z.string().readonly(),
});

export const ZodDbModel = z.object({
    [modelIdKeyName]: ZodModelId.readonly(),
    [userIdKeyName]:  z.string().readonly(),
    modelName:        z.string().nonempty().readonly(),
    createdAt:        z.string().nonempty().readonly(),
    lastModifiedAt:   z.string().nonempty().readonly(),
    compartments:     z.array(ZodDbCompartment.readonly()),
    transitions:      z.array(ZodDbTransition.readonly()),
    parameters:       z.array(ZodDbModelParameter.readonly()),
});

// "normal" types

export type ModelId = z.infer<typeof ZodModelId>;
export type TransitionId = z.infer<typeof ZodTransitionId>;
export type CompartmentId = z.infer<typeof ZodCompartmentId>;

export type DbModel = z.infer<typeof ZodDbModel>;
export type DbTransition = z.infer<typeof ZodDbTransition>;
export type DbCompartment = z.infer<typeof ZodDbCompartment>;
export type DbModelParameter = z.infer<typeof ZodDbModelParameter>;