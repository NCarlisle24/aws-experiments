import { ROUTES } from '../router.tsx';
import ProfileIcon from './ProfileIcon.tsx';
import NavLink from './NavLink.tsx';

export default function Navbar() {
    return (
        <div className="sticky top-0 z-1024 shadow-md h-(--navbar-height) flex justify-end items-center 
                        px-6 py-5 gap-6 bg-secondary">

            <NavLink dest={ROUTES.HOME}>Home</NavLink>
            <NavLink dest={ROUTES.USER_MODELS}>Models</NavLink>

            <ProfileIcon />
        </div>
    )
}