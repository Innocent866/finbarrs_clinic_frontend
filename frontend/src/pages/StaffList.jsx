import { useEffect, useState } from 'react';
import api from '../api';
import { UserPlus, Trash2, CheckCircle2, AlertTriangle, Stethoscope, User, Pencil, X } from 'lucide-react';

const StaffList = () => {
    const [staff, setStaff] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', role: 'NURSE' });
    const [status, setStatus] = useState(null); // success, error
    const [editingId, setEditingId] = useState(null);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        try {
            if (editingId) {
                // Update existing user
                const payload = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty password if not changing
                
                await api.put(`/users/${editingId}`, payload);
                setStatus('success');
            } else {
                // Create new user
                await api.post('/users', formData);
                setStatus('success');
            }
            
            resetForm();
            fetchStaff();
            setTimeout(() => setStatus(null), 3000);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const handleEdit = (member) => {
        setFormData({
            fullName: member.fullName,
            email: member.email,
            phone: member.phone || '', // Handle missing phone
            role: member.role,
            password: '' // Don't fill password
        });
        setEditingId(member._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchStaff();
            } catch (error) {
                console.error("Failed to delete staff", error);
                alert('Failed to delete staff member');
            }
        }
    };

    const resetForm = () => {
        setFormData({ fullName: '', email: '', phone: '', password: '', role: 'NURSE' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Staff</h1>
                    <p className="text-slate-500">Manage doctors and nurses</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 font-medium transition"
                    >
                        <UserPlus size={18} /> Add Staff
                    </button>
                )}
            </div>

            {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{editingId ? 'Staff updated successfully.' : 'Staff member added successfully.'}</span>
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={20} />
                    <span className="font-medium">Operation failed. Check credentials or try again.</span>
                </div>
            )}

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 max-w-2xl animate-in slide-in-from-top-4 fade-in relative">
                     <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1">
                        <X size={20} />
                    </button>
                    <h3 className="font-bold text-lg mb-4 text-slate-800">{editingId ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                            <input 
                                type="tel"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="09030030000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password {editingId && '(Leave blank to keep current)'}</label>
                            <input 
                                type="password"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                required={!editingId}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                                {editingId ? 'Update Account' : 'Save Account'}
                            </button>
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
                            <th className="p-5">Phone</th>
                            <th className="p-5">Status</th>
                            <th className="p-5 text-right">Actions</th>
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
                                <td className="p-5 text-slate-600 font-mono text-xs">{member.phone || '-'}</td>
                                <td className="p-5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => handleEdit(member)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(member._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                         {staff.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">No medical staff found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffList;
