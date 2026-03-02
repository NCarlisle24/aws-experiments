import { Outlet } from 'react-router';

import './global.css';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';

export default function MainLayout() {
    return (
        <div>
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}