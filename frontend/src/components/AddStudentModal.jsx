import { useState, useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import api from '../api';

const AddStudentModal = ({ onClose, onStudentAdded, studentToEdit = null }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        admissionNo: '',
        class: '',
        studentType: 'Day',
        bloodGroup: '',
        genotype: '',
        allergies: 'None',
        chronicCondition: 'None',
        parentPhone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentToEdit) {
            setFormData({
                fullName: studentToEdit.fullName || '',
                admissionNo: studentToEdit.admissionNo || '',
                class: studentToEdit.class || '',
                studentType: studentToEdit.studentType || 'Day',
                bloodGroup: studentToEdit.bloodGroup || '',
                genotype: studentToEdit.genotype || '',
                allergies: studentToEdit.allergies || 'None',
                chronicCondition: studentToEdit.chronicCondition || 'None',
                parentPhone: studentToEdit.parentPhone || ''
            });
        }
    }, [studentToEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (studentToEdit) {
                await api.put(`/students/${studentToEdit._id}`, formData);
            } else {
                await api.post('/students', formData);
            }
            onStudentAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${studentToEdit ? 'update' : 'add'} student`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{studentToEdit ? 'Edit Student' : 'Add New Student'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle size={20} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input 
                                required
                                name="fullName"
                                value={formData.fullName} 
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Admission Number</label>
                            <input 
                                required
                                name="admissionNo"
                                value={formData.admissionNo} 
                                onChange={handleChange}
                                placeholder="e.g. ADM/2024/001"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Class</label>
                            <select 
                                required
                                name="class"
                                value={formData.class} 
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">Select Class</option>
                                <option value="JSS 1">JSS 1</option>
                                <option value="JSS 2">JSS 2</option>
                                <option value="JSS 3">JSS 3</option>
                                <option value="SSS 1">SSS 1</option>
                                <option value="SSS 2">SSS 2</option>
                                <option value="SSS 3">SSS 3</option>
                            </select>
                        </div>

                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Student Type</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="studentType" 
                                        value="Day" 
                                        checked={formData.studentType === 'Day'} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Day Student</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="studentType" 
                                        value="Boarder" 
                                        checked={formData.studentType === 'Boarder'} 
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Boarder</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Blood Group</label>
                            <select 
                                name="bloodGroup"
                                value={formData.bloodGroup} 
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">Unknown</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Genotype</label>
                            <select 
                                name="genotype"
                                value={formData.genotype} 
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">Unknown</option>
                                <option value="AA">AA</option>
                                <option value="AS">AS</option>
                                <option value="SS">SS</option>
                                <option value="AC">AC</option>
                            </select>
                        </div>
                        
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Allergies</label>
                            <input 
                                name="allergies"
                                value={formData.allergies} 
                                onChange={handleChange}
                                placeholder="List allergies or 'None'"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                        
                         <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Chronic Conditions</label>
                            <input 
                                name="chronicCondition"
                                value={formData.chronicCondition} 
                                onChange={handleChange}
                                placeholder="List conditions or 'None'"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">Parent Phone</label>
                            <input 
                                name="parentPhone"
                                value={formData.parentPhone} 
                                onChange={handleChange}
                                placeholder="e.g. 08012345678"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : <><Check size={20} /> {studentToEdit ? 'Update Student' : 'Save Student'}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
