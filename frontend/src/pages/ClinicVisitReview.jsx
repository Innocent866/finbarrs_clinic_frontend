import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Save, User as UserIcon, Calendar, Activity, Pill, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ClinicVisitReview = () => {
    const { id } = useParams();
    const navigate = useNavigate(); // navigate is defined in the component
    const { user } = useAuth();
    const [visit, setVisit] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // ... useEffect ...

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const { data } = await api.get(`/visits/${id}`);
                setVisit(data);
                if (data.doctorComment) {
                    setComment(data.doctorComment);
                }
            } catch (err) {
                console.error("Failed to fetch visit", err);
                setError('Failed to load visit details');
            } finally {
                setLoading(false);
            }
        };
        fetchVisit();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/visits/${id}/review`, { doctorComment: comment });
            navigate('/'); // Go back to dashboard
        } catch (err) {
            console.error("Failed to submit review", err);
            setError('Failed to submit review');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 text-center">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button 
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 font-semibold"
            >
                Return to Dashboard
            </button>
        </div>
    );

    if (!visit) return null;

    const isReadOnly = visit.isReviewed;
    const canReview = user?.role === 'DOCTOR';

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <button 
                onClick={() => navigate('/')}
                className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Visit Review</h1>
                    <p className="text-slate-500">Reviewing clinical record for <span className="font-semibold text-slate-700">{visit.studentId?.fullName}</span></p>
                </div>
                {visit.isReviewed && (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                        <CheckCircle size={20} />
                        Reviewed
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Student & Visit Details */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <UserIcon size={20} className="text-blue-500" />
                            Student Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1">Name</label>
                                <p className="font-medium text-slate-700">{visit.studentId?.fullName}</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1">Class</label>
                                <p className="font-medium text-slate-700">{visit.studentId?.class}</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1">Admission No</label>
                                <p className="font-medium text-slate-700">{visit.studentId?.admissionNo}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-red-500" />
                            Clinical Details
                        </h2>
                        
                        <div>
                            <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Symptoms</label>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{visit.symptoms}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Diagnosis</label>
                                <p className="text-slate-800 font-bold bg-blue-50 p-3 rounded-lg border border-blue-100/50">{visit.diagnosis}</p>
                            </div>
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Outcome</label>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{visit.outcome}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider flex items-center gap-2">
                                <FileText size={14} /> Treatment
                            </label>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{visit.treatment}</p>
                        </div>

                        {visit.drugs && (
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider flex items-center gap-2">
                                    <Pill size={14} /> Prescribed Drugs
                                </label>
                                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{visit.drugs}</p>
                            </div>
                        )}
                        
                         <div className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100 flex justify-between">
                            <span>Attended by: <span className="font-medium text-slate-600">{visit.attendedBy?.fullName}</span></span>
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(visit.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Doctor's Action */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg shadow-blue-900/5 border border-slate-100 p-6 sticky top-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Doctor's Review</h2>
                        {visit.isReviewed ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                                <div className="mb-4">
                                    <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider">Note</label>
                                    <p className="text-slate-700 whitespace-pre-wrap">{visit.doctorComment}</p>
                                </div>
                                <div className="pt-3 border-t border-slate-200/50">
                                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">Reviewed By</p>
                                    <p className="font-semibold text-slate-700 mb-2">{visit.reviewedBy?.fullName || 'Doctor'}</p>
                                    <p className="text-slate-500 text-xs uppercase font-bold mb-1">Date</p>
                                    <p className="text-slate-600">{new Date(visit.reviewedAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ) : canReview ? (
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-slate-600 font-semibold mb-2 text-sm">Medical Comment / Note</label>
                                    <textarea
                                        className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                                        placeholder="Enter your medical review, recommendations, or approval here..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        disabled={isReadOnly}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save size={18} /> Mark as Reviewed
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-orange-50 border border-orange-100 text-orange-800 p-4 rounded-xl flex items-start gap-3">
                                <Activity className="shrink-0 mt-0.5" size={18} />
                                <div className="text-sm">
                                    <p className="font-bold">Pending Review</p>
                                    <p className="opacity-80 mt-1">This visit has not yet been reviewed by a doctor.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicVisitReview;
