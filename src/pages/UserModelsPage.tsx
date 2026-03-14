import { useAuth } from '../auth/index.ts';
import restApi from '../rest-api/index.ts';
import { type Model, type ModelId } from '../../amplify/data/tables.ts';

import React from 'react';
import LargeLoader from '../components/LargeLoader.tsx';
import CreateModelButton from '../components/CreateModelButton.tsx';
import ModelEntry from '../components/ModelEntry.tsx';

export default function ModelsPage() {
    const [models, setModels] = React.useState<Model[] | null>(null);

    const authContextData = useAuth();

    React.useEffect(() => {
        (async () => {
            const fetchedModels = await restApi.getUserModels(authContextData);
            setModels(fetchedModels);
        })();
    }, []);

    const createDeleteHandler = (modelId: ModelId) => {
        return () => setModels(prev => {
            if (prev === null) return null;
            return prev.filter(model => model.id !== modelId);
        });
    }

    return (
        <div className="h-full w-full">
            <div className="flex justify-between">
                <h1 className="title">Models</h1>
                <CreateModelButton />
            </div>
            <div className="flex flex-col w-full my-5 p-5 gap-2 rounded-sm bg-secondary">
                {models === null ?  <LargeLoader />
                : models.length == 0 ?  <div className="w-full text-center">(no models to display)</div>
                : models.map((model) => <ModelEntry model={model} key={model.id} 
                                                    afterDelete={createDeleteHandler(model.id)} />
                )}
            </div>
        </div>
    );
}