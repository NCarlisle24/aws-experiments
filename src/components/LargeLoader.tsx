import { Loader } from '@aws-amplify/ui-react';

interface LargeLoaderProps {
    message?: string
};

export default function LargeLoader({ message }: LargeLoaderProps) {

    return (
        <div className="h-full flex flex-col justify-center items-center w-full">
            {message}
            <div className="w-[40%]">
                <Loader variation="linear"></Loader> 
            </div>
        </div>
    );
}