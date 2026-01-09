import { useState, useEffect } from 'react';
import api from '../api';
import { Bell, Clock, User, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminNotifications = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { data } = await api.get('/visits');
                setVisits(data);
                
                // Mark all as viewed when page loads
                await api.put('/visits/viewed');
                
                // Trigger a custom event or rely on polling (30s) in Layout to update badge
                // For immediate update, we can reload or use context, but polling is safer for now without context refactor
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
        
        // Optional: Poll for new notifications every 30 seconds
        const interval = setInterval(fetchVisits, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    if (loading) return (
        <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Bell className="text-blue-600" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clinic Activity Feed</h1>
                    <p className="text-slate-500">Real-time notifications of student clinic visits</p>
                </div>
            </div>

            <div className="space-y-4">
                {visits.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-slate-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">No activity yet</h3>
                        <p className="text-slate-500">New clinic visits will appear here.</p>
                    </div>
                ) : (
                    visits.map((visit) => (
                        <div key={visit._id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4 items-start md:items-center">
                            
                            {/* Icon / Status Indicator */}
                            <div className="shrink-0 pt-1 md:pt-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    visit.outcome === 'Referral' ? 'bg-red-50 text-red-600' :
                                    visit.outcome === 'Admitted' ? 'bg-amber-50 text-amber-600' :
                                    visit.outcome === 'Under Observation' ? 'bg-purple-50 text-purple-600' :
                                    'bg-blue-50 text-blue-600'
                                }`}>
                                    <FileText size={20} />
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                                    <Link to={`/students/${visit.studentId?._id}`} className="text-lg font-bold text-slate-800 hover:text-blue-600 transition truncate">
                                        {visit.studentId?.fullName}
                                    </Link>
                                    <span className="hidden md:block text-slate-300">•</span>
                                    <span className="text-sm text-slate-500 font-medium">{visit.studentId?.admissionNo}</span>
                                    <span className="hidden md:block text-slate-300">•</span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold w-fit">
                                        {visit.studentId?.class}
                                    </span>
                                </div>
                                <p className="text-slate-600 mb-1 line-clamp-1">
                                    <span className="font-semibold text-slate-700">Diagnosis:</span> {visit.diagnosis}
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                                    <span className="flex items-center gap-1">
                                        <User size={12} /> Attended by Nurse {visit.attendedBy?.fullName}
                                    </span>
                                    {visit.outcome && (
                                        <span className={`flex items-center gap-1 font-medium ${
                                            visit.outcome === 'Returned to Class' ? 'text-green-600' : 
                                            visit.outcome === 'Under Observation' ? 'text-purple-600' : 'text-slate-500'
                                        }`}>
                                            <CheckCircle2 size={12} /> {visit.outcome}
                                        </span>
                                    )}
                                    {visit.isReviewed && (
                                        <Link to={`/visits/${visit._id}/review`} className="flex items-center gap-1 font-bold text-blue-600 hover:underline">
                                           <CheckCircle2 size={12} /> Doctor Reviewed
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Time */}
                            <div className="whitespace-nowrap flex items-center gap-1.5 text-sm font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                                <Clock size={14} />
                                {formatTime(visit.createdAt)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
