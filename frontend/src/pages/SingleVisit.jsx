import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Save, User as UserIcon, Calendar, Activity, Pill, FileText, CheckCircle, Clipboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SingleVisit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [visit, setVisit] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [report, setReport] = useState('');
    const [reportSubmitting, setReportSubmitting] = useState(false);

    const [isEditingClinical, setIsEditingClinical] = useState(false);
    const [editDiagnosis, setEditDiagnosis] = useState('');
    const [editDrugs, setEditDrugs] = useState('');
    const [clinicalSubmitting, setClinicalSubmitting] = useState(false);

    // Full Edit State (Nurse)
    const [isEditingFull, setIsEditingFull] = useState(false);
    const [fullEditForm, setFullEditForm] = useState({
        symptoms: '', diagnosis: '', treatment: '', drugs: '', outcome: '',
        temperature: '', spo2: '', pulse: '', weight: '',
        followUpRequired: false, followUpDate: '', followUpNote: ''
    });

    useEffect(() => {
        const fetchVisit = async () => {
            try {
                const { data } = await api.get(`/visits/${id}`);
                setVisit(data);
                if (data.doctorComment) {
                    setComment(data.doctorComment);
                }
                
                // Initialize edit state
                setEditDiagnosis(data.diagnosis || '');
                setEditDrugs(data.drugs || '');

                // Initialize full edit state
                setFullEditForm({
                    symptoms: data.symptoms || '',
                    diagnosis: data.diagnosis || '',
                    treatment: data.treatment || '',
                    drugs: data.drugs || '',
                    outcome: data.outcome || '',
                    temperature: data.temperature || '',
                    spo2: data.spo2 || '',
                    pulse: data.pulse || '',
                    weight: data.weight || '',
                    followUpRequired: data.followUpRequired || false,
                    followUpDate: data.followUpDate ? data.followUpDate.split('T')[0] : '', // Format for date input
                    followUpNote: data.followUpNote || ''
                });

            } catch (err) {
                console.error("Failed to fetch visit", err);
                setError('Failed to load visit details');
            } finally {
                setLoading(false);
            }
        };
        fetchVisit();
    }, [id]);

    const handleFullEditSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/visits/${id}`, fullEditForm);
            const { data } = await api.get(`/visits/${id}`);
            setVisit(data);
            setIsEditingFull(false);
            setSubmitting(false);
        } catch (err) {
            console.error("Failed to update visit", err);
            setError('Failed to update visit details');
            setSubmitting(false);
        }
    };

    const handleClinicalSubmit = async (e) => {
        e.preventDefault();
        setClinicalSubmitting(true);
        try {
            await api.put(`/visits/${id}/clinical-details`, {
                diagnosis: editDiagnosis,
                drugs: editDrugs
            });
            const { data } = await api.get(`/visits/${id}`);
            setVisit(data);
            setIsEditingClinical(false);
            setClinicalSubmitting(false);
        } catch (err) {
            console.error("Failed to update clinical details", err);
            setError('Failed to update clinical details');
            setClinicalSubmitting(false);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        setReportSubmitting(true);
        try {
            await api.put(`/visits/${id}/follow-up-report`, { report });
            const { data } = await api.get(`/visits/${id}`);
            setVisit(data); // Refresh data
            setReport(''); // Clear input
            setReportSubmitting(false);
        } catch (err) {
            console.error("Failed to submit report", err);
            setError('Failed to submit report');
            setReportSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/visits/${id}/review`, { doctorComment: comment });
            const { data } = await api.get(`/visits/${id}`);
            setVisit(data);
            setSubmitting(false);
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
                onClick={() => navigate(-1)}
                className="text-blue-600 hover:text-blue-800 font-semibold"
            >
                Go Back
            </button>
        </div>
    );

    if (!visit) return null;

    const isReadOnly = visit.isReviewed;
    const canReview = user?.role === 'DOCTOR';

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10">
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Back
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Visit Details</h1>
                    <p className="text-slate-500">Clinical record for <span className="font-semibold text-slate-700">{visit.studentId?.fullName}</span></p>
                </div>
                <div className="flex items-center gap-3">
                     {user?.role === 'NURSE' && !isEditingFull && (
                        <button
                            onClick={() => setIsEditingFull(true)}
                            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
                        >
                            <Clipboard size={18} /> Edit Visit
                        </button>
                    )}

                    {visit.isReviewed && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <CheckCircle size={20} />
                            Reviewed
                        </div>
                    )}
                </div>
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

                    {isEditingFull ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                             <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-600" />
                                Edit Clinical Details
                            </h2>
                            <form onSubmit={handleFullEditSubmit} className="space-y-6">
                                {/* Vitals */}
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Vital Signs</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Temperature (°C)</label>
                                            <input type="number" step="0.1" value={fullEditForm.temperature} onChange={(e) => setFullEditForm({ ...fullEditForm, temperature: e.target.value })} className="w-full p-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">SpO2 (%)</label>
                                            <input type="number" value={fullEditForm.spo2} onChange={(e) => setFullEditForm({ ...fullEditForm, spo2: e.target.value })} className="w-full p-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Pulse (bpm)</label>
                                            <input type="number" value={fullEditForm.pulse} onChange={(e) => setFullEditForm({ ...fullEditForm, pulse: e.target.value })} className="w-full p-2 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Weight (kg)</label>
                                            <input type="number" step="0.1" value={fullEditForm.weight} onChange={(e) => setFullEditForm({ ...fullEditForm, weight: e.target.value })} className="w-full p-2 border rounded-lg" />
                                        </div>
                                    </div>
                                </div>

                                {/* Clinical */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Symptoms</label>
                                        <textarea value={fullEditForm.symptoms} onChange={(e) => setFullEditForm({ ...fullEditForm, symptoms: e.target.value })} className="w-full p-2 border rounded-lg" rows="3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Diagnosis</label>
                                        <textarea value={fullEditForm.diagnosis} onChange={(e) => setFullEditForm({ ...fullEditForm, diagnosis: e.target.value })} className="w-full p-2 border rounded-lg" rows="3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Treatment</label>
                                        <textarea value={fullEditForm.treatment} onChange={(e) => setFullEditForm({ ...fullEditForm, treatment: e.target.value })} className="w-full p-2 border rounded-lg" rows="3" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Prescribed Drugs</label>
                                        <textarea value={fullEditForm.drugs} onChange={(e) => setFullEditForm({ ...fullEditForm, drugs: e.target.value })} className="w-full p-2 border rounded-lg" rows="3" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Outcome</label>
                                        <textarea value={fullEditForm.outcome} onChange={(e) => setFullEditForm({ ...fullEditForm, outcome: e.target.value })} className="w-full p-2 border rounded-lg" rows="2" />
                                    </div>
                                </div>

                                {/* Follow Up */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <input 
                                            type="checkbox" 
                                            id="editFollowUp" 
                                            checked={fullEditForm.followUpRequired} 
                                            onChange={(e) => setFullEditForm({ ...fullEditForm, followUpRequired: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="editFollowUp" className="text-sm font-bold text-slate-700">Requires Follow-up?</label>
                                    </div>
                                    
                                    {fullEditForm.followUpRequired && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                                                <input type="date" value={fullEditForm.followUpDate} onChange={(e) => setFullEditForm({ ...fullEditForm, followUpDate: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Note</label>
                                                <input type="text" value={fullEditForm.followUpNote} onChange={(e) => setFullEditForm({ ...fullEditForm, followUpNote: e.target.value })} className="w-full p-2 border rounded-lg text-sm" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingFull(false)}
                                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md"
                                    >
                                        {submitting ? 'Saving...' : 'Save All Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (


                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity size={20} className="text-blue-600" />
                                Clinical Details
                            </h2>
                            {user?.role === 'DOCTOR' && !isEditingClinical && (
                                <button
                                    onClick={() => setIsEditingClinical(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                >
                                    Edit Details
                                </button>
                            )}
                        </div>
                        
                        {isEditingClinical ? (
                            <form onSubmit={handleClinicalSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Symptoms</h3>
                                        <p className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm cursor-not-allowed text-stone-500">{visit.symptoms}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Diagnosis</h3>
                                        <textarea
                                            value={editDiagnosis}
                                            onChange={(e) => setEditDiagnosis(e.target.value)}
                                            className="w-full text-slate-800 font-medium bg-white p-2 rounded-lg border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Treatment</h3>
                                        <p className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm cursor-not-allowed text-stone-500">{visit.treatment}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-500 mb-1">Prescribed Drugs</h3>
                                        <textarea
                                            value={editDrugs}
                                            onChange={(e) => setEditDrugs(e.target.value)}
                                            className="w-full text-slate-800 font-medium bg-white p-2 rounded-lg border border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                                            rows="2"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                     <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingClinical(false);
                                            setEditDiagnosis(visit.diagnosis || '');
                                            setEditDrugs(visit.drugs || '');
                                        }}
                                        className="text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={clinicalSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        {clinicalSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Symptoms</h3>
                                    <p className="text-slate-800 font-medium">{visit.symptoms}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Diagnosis</h3>
                                    <p className="text-slate-800 font-medium">{visit.diagnosis}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Treatment</h3>
                                    <p className="text-slate-800 font-medium">{visit.treatment}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Prescribed Drugs</h3>
                                    <p className="text-slate-800 font-medium">{visit.drugs}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-slate-100">
                             <h3 className="text-sm font-semibold text-slate-500 mb-1">Outcome</h3>
                             <p className="text-slate-800">{visit.outcome}</p>
                        </div>

                        {(visit.temperature || visit.spo2 || visit.pulse || visit.weight) && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <label className="block text-slate-400 font-semibold mb-2 uppercase text-xs tracking-wider flex items-center gap-2">
                                    <Activity size={14} /> Vital Signs
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {visit.temperature && (
                                        <div>
                                            <span className="text-xs text-slate-500 block">Temp</span>
                                            <span className="font-semibold text-slate-700">{visit.temperature}°C</span>
                                        </div>
                                    )}
                                    {visit.spo2 && (
                                        <div>
                                            <span className="text-xs text-slate-500 block">SpO2</span>
                                            <span className="font-semibold text-slate-700">{visit.spo2}%</span>
                                        </div>
                                    )}
                                    {visit.pulse && (
                                        <div>
                                            <span className="text-xs text-slate-500 block">Pulse</span>
                                            <span className="font-semibold text-slate-700">{visit.pulse} bpm</span>
                                        </div>
                                    )}
                                    {visit.weight && (
                                        <div>
                                            <span className="text-xs text-slate-500 block">Weight</span>
                                            <span className="font-semibold text-slate-700">{visit.weight} kg</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <label className="block text-slate-400 font-semibold mb-1 uppercase text-xs tracking-wider flex items-center gap-2">
                                <FileText size={14} /> Treatment
                            </label>
                            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">{visit.treatment}</p>
                        </div>

                        {visit.followUpRequired && (
                            <div className="mt-6 pt-6 border-t border-slate-100 bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <h3 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <Calendar size={16} /> Follow-up Required
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-600/70 mb-1">Scheduled Date</label>
                                        <p className="font-semibold text-blue-900">{new Date(visit.followUpDate).toLocaleDateString()}</p>
                                    </div>
                                    {visit.followUpNote && (
                                        <div>
                                            <label className="block text-xs font-semibold text-blue-600/70 mb-1">Reason / Note</label>
                                            <p className="text-blue-900 text-sm">{visit.followUpNote}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {visit.drugs && !isEditingClinical && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
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
                    )}


                    {/* Follow-up Report Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clipboard size={20} className="text-blue-600" />
                            Follow-up Reports
                        </h2>
                        
                        {visit.followUpReports && visit.followUpReports.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {visit.followUpReports.map((report, index) => (
                                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                {report.addedBy?.fullName || 'Staff'}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(report.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-700">{report.note}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Only Nurses can add reports */}
                        {user?.role === 'NURSE' && (
                            <form onSubmit={handleReportSubmit} className="mt-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Add Report / Update</h3>
                                <div className="mb-4">
                                    <textarea
                                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                                        placeholder="Enter follow-up details..."
                                        rows="3"
                                        value={report}
                                        onChange={(e) => setReport(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={reportSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-sm"
                                >
                                    {reportSubmitting ? 'Saving...' : 'Add Report'}
                                </button>
                            </form>
                        )}
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

export default SingleVisit;
