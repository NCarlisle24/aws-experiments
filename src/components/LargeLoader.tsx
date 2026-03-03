import { Loader } from '@aws-amplify/ui-react';

export default function LargeLoader() {

    return (
        <div className="h-full flex justify-center items-center px-[30vw]">
            <Loader variation="linear"></Loader> 
        </div>
    );
}