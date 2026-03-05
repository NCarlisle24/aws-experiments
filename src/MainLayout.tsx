import { Outlet } from 'react-router'; // accesses children in the react router

import './global.css';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';

export default function MainLayout() {
    return (
        <div className="bg-primary text-white min-h-screen flex flex-col h-full">
            <Navbar />

            <main className="flex-1 h-full py-15 px-20">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}