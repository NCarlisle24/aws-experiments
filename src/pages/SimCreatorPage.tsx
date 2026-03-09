import { SimCreator } from '../sim-creator';
import Navbar from '../components/Navbar';

export default function SimCreatorPage() {
    // TODO: implement authentication checking

    return (
        <div className="bg-primary text-white min-h-screen flex flex-col h-full">
            <Navbar />
            <SimCreator></SimCreator>
        </div>
    );
}