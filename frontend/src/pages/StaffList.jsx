import { useEffect, useState } from 'react';
import api from '../api';
import { UserPlus, Trash2, CheckCircle2, AlertTriangle, Stethoscope, User } from 'lucide-react';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'NURSE' });
    const [status, setStatus] = useState(null); // success, error

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const { data } = await api.get('/users');
            setStaff(data.filter(u => u.role === 'NURSE' || u.role === 'DOCTOR'));
        } catch (error) {
            console.error("Failed to fetch staff", error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            await api.post('/users', formData);
            setShowForm(false);
            setFormData({ fullName: '', email: '', password: '', role: 'NURSE' });
            fetchStaff();
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Staff</h1>
                    <p className="text-slate-500">Manage doctors and nurses</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 font-medium transition"
                >
                    <UserPlus size={18} /> Add Staff
                </button>
            </div>

            {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">Staff member added successfully.</span>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={20} />
                    <span className="font-medium">Failed to add staff member. Check credentials or try again.</span>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl animate-in slide-in-from-top-4 fade-in">
                    <h3 className="font-bold text-lg mb-4 text-slate-800">Add New Staff Member</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input 
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                                    value={formData.fullName} 
                                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                                    required
                                    placeholder="e.g. Dr. Sarah Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select 
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="NURSE">Nurse</option>
                                    <option value="DOCTOR">Doctor</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input 
                                type="email"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                required
                                placeholder="name@school.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <input 
                                type="password"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Save Account</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="p-5">Name</th>
                            <th className="p-5">Role</th>
                            <th className="p-5">Email</th>
                            <th className="p-5">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {staff.map(member => (
                            <tr key={member._id} className="hover:bg-slate-50/50 transition">
                                <td className="p-5 font-medium text-slate-800">{member.fullName}</td>
                                <td className="p-5">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                        ${member.role === 'DOCTOR' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600'}
                                    `}>
                                        {member.role === 'DOCTOR' ? <Stethoscope size={14} /> : <User size={14} />}
                                        {member.role === 'DOCTOR' ? 'Doctor' : 'Nurse'}
                                    </span>
                                </td>
                                <td className="p-5 text-slate-600">{member.email}</td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                         {staff.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-500">No medical staff found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffList;
