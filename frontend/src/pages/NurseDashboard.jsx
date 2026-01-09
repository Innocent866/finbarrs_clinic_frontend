import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FileText, Users, Clock, ArrowRight, Activity, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const NurseDashboard = () => {
    const { user } = useAuth();
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { data } = await api.get('/visits');
                // Get top 5 recent visits
                setRecentVisits(data.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch visits', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading workspace...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Hello, Nurse {user?.fullName?.split(' ')[0]}</h1>
                <p className="text-slate-500">Here's what's happening in the clinic today.</p>
            </header>

            {/* Quick Actions / Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                
                {/* Primary Action: New Visit */}
                <Link to="/visits/new" className="group relative overflow-hidden bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all transform hover:-translate-y-1">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="bg-white/20 w-fit p-3 rounded-xl mb-4">
                            <FileText size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">New Consultation</h3>
                            <p className="text-blue-100 text-sm opacity-90">Start a new clinical record</p>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-semibold bg-white/10 w-fit px-3 py-1.5 rounded-lg group-hover:bg-white text-blue-50 group-hover:text-blue-600 transition-colors">
                            Start Now <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                </Link>

                {/* Secondary Action: Students */}
                <Link to="/students" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                    <div className="bg-emerald-50 w-fit p-3 rounded-xl mb-4 text-emerald-600">
                        <Users size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Student Directory</h3>
                    <p className="text-slate-500 text-sm mb-4">Search & view medical profiles</p>
                    <span className="text-emerald-600 text-sm font-semibold flex items-center group-hover:underline">
                        View Directory <ArrowRight size={16} className="ml-2" />
                    </span>
                </Link>

                {/* Stat: Visits Today (Mock or calculated) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="bg-purple-50 w-fit p-3 rounded-xl mb-4 text-purple-600">
                        <Activity size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Recent Activity</h3>
                    <p className="text-slate-500 text-sm">Last 5 visits recorded</p>
                </div>
            </div>

            {/* Recent Visits Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={20} className="text-slate-400" />
                        Recent Consultations
                    </h2>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Student</th>
                                <th className="px-6 py-4 font-semibold">Class</th>
                                <th className="px-6 py-4 font-semibold">Diagnosis</th>
                                <th className="px-6 py-4 font-semibold">Outcome</th>
                                <th className="px-6 py-4 font-semibold">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentVisits.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No recent visits found.
                                    </td>
                                </tr>
                            ) : (
                                recentVisits.map((visit) => (
                                    <tr key={visit._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800">{visit.studentId?.fullName}</div>
                                            <div className="text-xs text-slate-500">{visit.studentId?.admissionNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{visit.studentId?.class}</td>
                                        <td className="px-6 py-4 text-slate-700 font-medium">{visit.diagnosis}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                visit.outcome === 'Returned to Class' ? 'bg-green-100 text-green-700' :
                                                visit.outcome === 'Sent to Hostel' ? 'bg-amber-100 text-amber-700' :
                                                visit.outcome === 'Under Observation' ? 'bg-purple-100 text-purple-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {visit.outcome}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {formatDate(visit.createdAt)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NurseDashboard;
