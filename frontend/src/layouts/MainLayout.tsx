import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './MainLayout.css';

function MainLayout() {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <Topbar />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
