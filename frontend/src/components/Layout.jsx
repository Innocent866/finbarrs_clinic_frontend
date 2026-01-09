import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { LogOut, LayoutDashboard, Users, User, FileText, HeartPulse, Menu, X, Bell } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count for admins
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            const fetchCount = async () => {
                try {
                    const { data } = await api.get('/visits/unread');
                    setUnreadCount(data.count);
                } catch (error) {
                    console.error("Failed to fetch unread count", error);
                }
            };
            fetchCount();
            const interval = setInterval(fetchCount, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const NavItem = ({ to, icon: Icon, children, badge }) => (
        <Link 
            to={to} 
            onClick={() => setIsSidebarOpen(false)} 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive(to) 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
        >
            <Icon size={20} className={`${isActive(to) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="font-medium">{children}</span>
            {badge > 0 && (
                <span className="absolute right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {badge}
                </span>
            )}
        </Link>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            
            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 z-20 justify-between">
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                         <div className="bg-blue-600 p-1.5 rounded-md">
                            <HeartPulse size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-800">MediCare</span>
                    </div>
                </div>
                {user?.role === 'ADMIN' && unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} New
                    </div>
                )}
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 border-b border-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <HeartPulse size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white">MediCare</h1>
                            <p className="text-xs text-slate-400 font-medium tracking-wide opacity-75">SCHOOL HEALTH</p>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-4">Menu</div>
                    
                    <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem to="/students" icon={Users}>Students</NavItem>

                    {user?.role === 'NURSE' && (
                        <NavItem to="/visits/new" icon={FileText}>New Visit</NavItem>
                    )}

                    {user?.role === 'ADMIN' && (
                        <>
                            <NavItem to="/notifications" icon={Bell} badge={unreadCount}>Notifications</NavItem>
                            <NavItem to="/nurses" icon={User}>Medical Staff</NavItem>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.fullName}</p>
                            <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    user?.role === 'ADMIN' ? 'bg-purple-500' : 
                                    user?.role === 'DOCTOR' ? 'bg-blue-500' : 
                                    'bg-green-500'
                                }`}></span>
                                {user?.role}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 font-medium group"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" /> 
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50 relative w-full pt-16 lg:pt-0">
                {/* Header for mobile or extra actions could go here, for now direct content */}
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>
                <div className="relative z-0 h-full">
                   <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
