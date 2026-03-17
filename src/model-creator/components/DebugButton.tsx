import { useModelCreator, type ModelCreatorContextData } from "../ModelCreatorContext";
import { ModelLib } from "../system";

const contextDataSelector = (data: ModelCreatorContextData) => ({
    model: data.model!
});

export default function DebugButton() {
    const { model } = useModelCreator(contextDataSelector);

    return (
        <a className="bg-quaternary p-2 rounded-sm cursor-pointer text-center bg-green-800 flex items-center justify-center" 
            onClick={() => { ModelLib.print(model); console.log(ModelLib.convertToEpimorphCode(model)) }}>
                Debug button<br />
        </a>
    );
}