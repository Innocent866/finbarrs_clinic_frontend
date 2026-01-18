import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Stethoscope, Clipboard, Pill, Activity, CheckCircle2, Calendar } from 'lucide-react';

const NewVisitForm = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const studentId = searchParams.get('studentId');
    const navigate = useNavigate();
    
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        symptoms: '',
        diagnosis: '',
        treatment: '',
        drugs: '',
        temperature: '',
        spo2: '',
        pulse: '',
        weight: '',
        followUpRequired: false,
        followUpDate: '',
        followUpNote: '',
        outcome: 'Returned to Class'
    });
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error'

    // Fetch initial student if ID exists
    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        const fetchStudent = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/students/${studentId}`);
                setStudent(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [studentId]);

    // Search students for selection
    useEffect(() => {
        const searchStudents = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                // In a real app we'd search via API query, here we fetch all and filter client-side for simplicity
                // or assume we have a search endpoint. Using getAll for now as per previous context.
                const { data } = await api.get('/students');
                const filtered = data.filter(s => 
                    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
                );
                setSearchResults(filtered);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(() => {
            if (!studentId && searchTerm) searchStudents();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, studentId]);

    const handleSelectStudent = (selectedStudent) => {
        setStudent(selectedStudent);
        setSearchParams({ studentId: selectedStudent._id });
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null);
        try {
            await api.post('/visits', {
                studentId: student._id, // Use state student ID
                ...formData
            });
            setSubmitStatus('success');
            setTimeout(() => navigate(`/students/${student._id}`), 1500); 
        } catch (error) {
            console.error(error);
            setSubmitStatus('error');
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Retrieving student details...</div>;

    // STUDENT SELECTION VIEW
    if (!student) return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link to="/students" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 font-medium">
                <ArrowLeft size={20} /> Back to Directory
            </Link>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <Stethoscope size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Select a Patient</h2>
                <p className="text-slate-500 mb-8">Search for a student to start a new consultation session.</p>

                <div className="relative max-w-md mx-auto">
                    <input 
                        type="text"
                        placeholder="Search by name or admission no..."
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-3.5 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    )}

                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-10 text-left max-h-80 overflow-y-auto">
                            {searchResults.map(s => (
                                <button 
                                    key={s._id}
                                    onClick={() => handleSelectStudent(s)}
                                    className="w-full p-4 hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <div>
                                        <p className="font-bold text-slate-800">{s.fullName}</p>
                                        <p className="text-sm text-slate-500">{s.admissionNo} • {s.class}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${s.studentType === 'Boarder' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {s.studentType}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {searchTerm.length > 1 && searchResults.length === 0 && !isSearching && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl text-slate-500 text-sm">
                            No students found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // MAIN FORM VIEW
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button onClick={() => { setStudent(null); setSearchParams({}); }} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6 font-medium">
                <ArrowLeft size={20} /> Change Patient
            </button>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                
                {/* Side Panel: Student Summary */}
                <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 top-8 sticky">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-3xl font-bold text-blue-500 mb-3">
                            {student.fullName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{student.fullName}</h2>
                        <p className="text-slate-500 font-medium">{student.admissionNo}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm">Class</span>
                            <span className="font-semibold text-slate-700">{student.class}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm">Type</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${student.studentType === 'Boarder' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                {student.studentType}
                            </span>
                        </div>
                        <div className="py-2">
                            <span className="text-slate-500 text-sm block mb-1">Medical Alerts</span>
                            {(student.allergies || student.chronicCondition) ? (
                                <div className="space-y-1">
                                    {student.allergies && <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-medium">Allergy: {student.allergies}</div>}
                                    {student.chronicCondition && <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-100 font-medium">{student.chronicCondition}</div>}
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400">None</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="w-full md:w-2/3">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Stethoscope className="text-blue-600" /> New Consultation
                        </h1>
                        
                        {submitStatus === 'success' && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
                                <CheckCircle2 size={20} />
                                <span className="font-medium">Visit recorded successfully! Redirecting...</span>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                                <Activity size={20} />
                                <span className="font-medium">Failed to record visit. Please try again.</span>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" /> Symptoms / Complaint
                                </label>
                                <textarea 
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50 min-h-[100px]" 
                                    placeholder="Patient's described symptoms..."
                                    required
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                    <Clipboard size={16} className="text-blue-500" /> Diagnosis
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                                    placeholder="Medical conclusion..."
                                    required 
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-blue-500" /> Treatment
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                                        placeholder="Procedures or advice..."
                                        required
                                        value={formData.treatment}
                                        onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                        <Pill size={16} className="text-blue-500" /> Medication (Optional)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                                        placeholder="Drugs administered..."
                                        value={formData.drugs}
                                        onChange={(e) => setFormData({...formData, drugs: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                    <Activity size={18} className="text-blue-500" /> Vital Signs
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Temperature (°C)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                            placeholder="36.5"
                                            value={formData.temperature}
                                            onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">SpO2 (%)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                            placeholder="98"
                                            value={formData.spo2}
                                            onChange={(e) => setFormData({...formData, spo2: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Pulse (bpm)</label>
                                        <input 
                                            type="number" 
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                            placeholder="72"
                                            value={formData.pulse}
                                            onChange={(e) => setFormData({...formData, pulse: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Weight (kg)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                            placeholder="65"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                <label className="flex items-center gap-3 cursor-pointer mb-4">
                                    <input 
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition"
                                        checked={formData.followUpRequired}
                                        onChange={(e) => setFormData({...formData, followUpRequired: e.target.checked})}
                                    />
                                    <span className="font-bold text-slate-700">Requires Follow-up Visit</span>
                                </label>
                                
                                {formData.followUpRequired && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Follow-up Date</label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
                                                <input 
                                                    type="date" 
                                                    required={formData.followUpRequired}
                                                    className="w-full pl-10 p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                                    value={formData.followUpDate}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Note (Optional)</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                                                placeholder="Reason for follow-up..."
                                                value={formData.followUpNote}
                                                onChange={(e) => setFormData({...formData, followUpNote: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Conclusion / Outcome</label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {['Returned to Class', 'Sent to Hostel', 'Sent Home', 'Referred to Hospital', 'Under Observation'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFormData({...formData, outcome: opt})}
                                            className={`p-3 rounded-xl text-sm font-semibold transition-all border-2
                                                ${formData.outcome === opt 
                                                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                                    : 'border-transparent bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }
                                            `}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all mt-6">
                                Submit Clinical Record
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewVisitForm;
