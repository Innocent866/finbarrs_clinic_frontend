import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FileText, CheckCircle, AlertCircle, Search } from 'lucide-react';

const DoctorDashboard = () => {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                const { data } = await api.get('/visits');
                setVisits(data);
            } catch (error) {
                console.error("Failed to fetch visits", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
    }, []);

    const reviewedCount = visits.filter(v => v.isReviewed).length;
    const pendingCount = visits.length - reviewedCount;
    const filteredVisits = visits.filter(visit => 
        visit.studentId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visit.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const StatCard = ({ title, value, icon: Icon, color, textColor }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${color}`}>
                <Icon size={28} className={textColor} />
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Doctor Dashboard</h1>
                    <p className="text-slate-500 mt-1">Review clinic visits and medical records</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Visits" 
                    value={visits.length} 
                    icon={FileText} 
                    color="bg-blue-50" 
                    textColor="text-blue-600" 
                />
                <StatCard 
                    title="Pending Reviews" 
                    value={pendingCount} 
                    icon={AlertCircle} 
                    color="bg-orange-50" 
                    textColor="text-orange-600" 
                />
                <StatCard 
                    title="Reviewed" 
                    value={reviewedCount} 
                    icon={CheckCircle} 
                    color="bg-green-50" 
                    textColor="text-green-600" 
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Clinic Visits</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search student or diagnosis..." 
                            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="p-4">Student</th>
                                <th className="p-4">Class</th>
                                <th className="p-4">Diagnosis</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                            {filteredVisits.length > 0 ? (
                                filteredVisits.map((visit) => (
                                    <tr key={visit._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{visit.studentId?.fullName}</td>
                                        <td className="p-4 text-slate-600">{visit.studentId?.class}</td>
                                        <td className="p-4 text-slate-600">{visit.diagnosis}</td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(visit.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5
                                                ${visit.isReviewed 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-orange-100 text-orange-700'
                                                }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${visit.isReviewed ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                {visit.isReviewed ? 'Reviewed' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link 
                                                to={`/visits/${visit._id}/review`}
                                                className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-semibold transition-all shadow-sm"
                                            >
                                                {visit.isReviewed ? 'View' : 'Review'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-500">
                                        No visits found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
