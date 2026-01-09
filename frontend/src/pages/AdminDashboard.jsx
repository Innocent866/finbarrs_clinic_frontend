import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Users, UserPlus, Activity, BedDouble, Sun, ArrowRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const promises = [api.get('/dashboard')];
                
                // If Admin, add unread count fetch to promises
                if (user?.role === 'ADMIN') {
                     // Catch error individually so it doesn't fail the whole Promise.all if one fails 
                    promises.push(
                        api.get('/visits/unread').catch(err => {
                            console.warn('Failed to fetch unread count', err);
                            return { data: { count: 0 } };
                        })
                    );
                }

                const [statsRes, unreadRes] = await Promise.all(promises);
                
                setStats(statsRes.data);
                if (unreadRes && user?.role === 'ADMIN') {
                    setUnreadCount(unreadRes.data.count);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    const StatCard = ({ title, value, icon: Icon, color, bg }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center transition-transform hover:-translate-y-1 duration-200">
            <div className={`p-4 ${bg} rounded-xl mr-5 text-${color}-600`}>
                <Icon size={24} className={`text-${color}-600`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
        </div>
    );

    if (loading) return <div className="p-10 text-center text-slate-500">Loading dashboard...</div>;
    
    if (!stats) return <div className="p-10 text-center text-red-500">Failed to load dashboard data. Please try refreshing.</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
                <p className="text-slate-500">Welcome to the medical administration dashboard.</p>
            </header>
            
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:${user?.role === 'ADMIN' ? 'grid-cols-5' : 'grid-cols-4'} gap-6 mb-10`}>
                {user?.role === 'ADMIN' && (
                    <Link to="/notifications" className="block transform transition-transform hover:-translate-y-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center h-full group">
                            <div className="p-4 bg-red-50 rounded-xl mr-5 text-red-600 group-hover:bg-red-100 transition-colors">
                                <Bell size={24} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">New Visits</p>
                                <h3 className="text-3xl font-bold text-slate-800">{unreadCount}</h3>
                            </div>
                        </div>
                    </Link>
                )}
                <StatCard 
                    title="Total Students" 
                    value={stats.totalStudents} 
                    icon={Users} 
                    color="blue" 
                    bg="bg-blue-50"
                />
                <StatCard 
                    title="Clinic Visits" 
                    value={stats.totalVisits} 
                    icon={Activity} 
                    color="emerald" 
                    bg="bg-emerald-50"
                />
                <StatCard 
                    title="Boarders" 
                    value={stats.studentDistribution.boarders} 
                    icon={BedDouble} 
                    color="purple" 
                    bg="bg-purple-50"
                />
                <StatCard 
                    title="Day Students" 
                    value={stats.studentDistribution.dayStudents} 
                    icon={Sun} 
                    color="orange" 
                    bg="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/students" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-200 group flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-slate-700">Manage Students</h3>
                                <p className="text-sm text-slate-500">View and edit student records</p>
                            </div>
                            <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition" />
                        </Link>
                        {user?.role === 'ADMIN' && (
                            <Link to="/nurses" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-200 group flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-slate-700">Manage Nurses</h3>
                                    <p className="text-sm text-slate-500">View and add staff</p>
                                </div>
                                <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition" />
                            </Link>
                        )}
                         {user?.role === 'NURSE' && (
                            <Link to="/visits/new" className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition border border-slate-200 group flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-slate-700">New Visit</h3>
                                    <p className="text-sm text-slate-500">Record a new clinic visit</p>
                                </div>
                                <ArrowRight size={20} className="text-slate-400 group-hover:text-blue-600 transition" />
                            </Link>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                    <h2 className="text-lg font-bold mb-2">Staff Summary</h2>
                    <p className="text-blue-100 mb-6 text-sm">Active medical personnel in the system.</p>
                    
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100 text-sm">Total Nurses</span>
                        <span className="text-2xl font-bold">{stats?.totalNurses || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
