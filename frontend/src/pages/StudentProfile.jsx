import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { FileText, ArrowLeft, Phone, AlertTriangle, Syringe, Clock, Activity } from 'lucide-react';

const StudentProfile = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const studentRes = await api.get(`/students/${id}`);
                setStudent(studentRes.data);
                
                const visitsRes = await api.get(`/visits?studentId=${id}`);
                setVisits(visitsRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-10 text-center text-slate-500">Loading student profile...</div>;
    if (!student) return <div className="p-10 text-center text-slate-500">Student not found</div>;

    const hasInfections = (student.allergies && student.allergies !== 'None') || (student.chronicCondition && student.chronicCondition !== 'None');

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 font-medium">
                <ArrowLeft size={20} /> Back to Directory
            </Link>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-3xl font-bold text-slate-400">
                            {student.fullName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-slate-800">{student.fullName}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.studentType === 'Boarder' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {student.studentType}
                                </span>
                            </div>
                            <p className="text-slate-500 mt-1 flex items-center gap-3">
                                <span className="font-medium text-slate-700">Admission No: {student.admissionNo}</span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                <span className="font-medium text-slate-700">Class: {student.class}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 min-w-[200px]">
                        <Link 
                            to={`/visits/new?studentId=${student._id}`} 
                            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 font-medium transition"
                        >
                            <FileText size={18} /> Record New Visit
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Medical Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Blood Group</p>
                                <p className="text-lg font-bold text-slate-800">{student.bloodGroup || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Genotype</p>
                                <p className="text-lg font-bold text-slate-800">{student.genotype || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Critical Alerts</h3>
                        {hasInfections ? (
                            <div className="space-y-3">
                                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                                    <div className="flex items-center gap-2 text-red-800 font-semibold text-sm mb-1">
                                        <AlertTriangle size={16} /> Allergies
                                    </div>
                                    <p className="text-red-600 text-sm">{student.allergies || 'None'}</p>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
                                        <Activity size={16} /> Chronic Conditions
                                    </div>
                                    <p className="text-amber-600 text-sm">{student.chronicCondition || 'None'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200">
                                <Activity className="mb-2 opacity-50" />
                                <span className="text-sm font-medium">No critical health alerts</span>
                            </div>
                        )}
                    </div>

                    <div className="p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Emergency Contact</h3>
                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                                <Phone size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Parent / Guardian</p>
                                <p className="text-lg font-bold text-slate-800 font-mono tracking-tight">{student.parentPhone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="text-blue-600" /> Recent Clinic History
            </h2>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="p-5">Date & Time</th>
                            <th className="p-5">Diagnosis & Symptoms</th>
                            <th className="p-5">Treatment Administered</th>
                            <th className="p-5">Action Taken</th>
                            <th className="p-5">Attended By</th>
                            <th className="p-5">Doctor's Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {visits.map(visit => (
                            <tr key={visit._id} className="hover:bg-slate-50/50 transition">
                                <td className="p-5 w-48">
                                    <div className="font-semibold text-slate-700">{new Date(visit.createdAt).toLocaleDateString()}</div>
                                    <div className="text-xs text-slate-500 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">
                                        {new Date(visit.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-semibold text-slate-800 mb-1">{visit.diagnosis}</div>
                                    <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                                        "{visit.symptoms}"
                                    </p>
                                </td>
                                <td className="p-5">
                                    <div className="text-slate-700">{visit.treatment}</div>
                                    {visit.drugs && (
                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
                                            <Syringe size={14} /> {visit.drugs}
                                        </div>
                                    )}
                                </td>
                                <td className="p-5">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold
                                        ${visit.outcome === 'Returned to Class' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                          visit.outcome === 'Sent to Hostel' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                          visit.outcome === 'Sent Home' ? 'bg-red-100 text-red-700 border border-red-200' : 
                                          visit.outcome === 'Under Observation' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                          'bg-blue-100 text-blue-700 border border-blue-200'
                                        }
                                    `}>
                                        {visit.outcome}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {visit.attendedBy?.fullName?.charAt(0) || '?'}
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">{visit.attendedBy?.fullName}</span>
                                    </div>
                                </td>
                                <td className="p-5">
                                    {visit.isReviewed ? (
                                        <Link 
                                            to={`/visits/${visit._id}/review`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 border border-green-200 transition"
                                        >
                                            <Activity size={14} /> View Note
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium italic">Pending Review</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {visits.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-16 text-center text-slate-400">
                                    <FileText size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No medical history recorded for this student.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentProfile;
