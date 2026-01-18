import { useEffect, useState } from 'react';
import api from '../api';
import { Search, Plus, Filter, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AddStudentModal from '../components/AddStudentModal';

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data } = await api.get('/students');
            setStudents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => 
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const classOrder = {
            'JSS 1': 1, 'JSS 2': 2, 'JSS 3': 3,
            'SSS 1': 4, 'SSS 2': 5, 'SSS 3': 6
        };
        const rankA = classOrder[a.class] || 99;
        const rankB = classOrder[b.class] || 99;
        
        if (rankA !== rankB) {
            return rankA - rankB;
        }
        
        return a.fullName.localeCompare(b.fullName);
    });

    const handleEdit = (student) => {
        setStudentToEdit(student);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student record?')) {
            try {
                await api.delete(`/students/${id}`);
                fetchStudents();
            } catch (error) {
                console.error("Failed to delete student", error);
                alert('Failed to delete student');
            }
        }
    };

    const StudentTypeBadge = ({ type }) => {
        const isBoarder = type === 'Boarder';
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isBoarder ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                {type}
            </span>
        );
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Loading student records...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Students Directory</h1>
                    <p className="text-slate-500">View and manage student health profiles</p>
                </div>
                {user.role === 'ADMIN' && (
                    <button 
                        onClick={() => {
                            setStudentToEdit(null);
                            setShowAddModal(true);
                        }}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-medium transition"
                    >
                        <Plus size={18} /> Add Student
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name or admission number..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="px-4 py-2.5 border border-slate-200 rounded-xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 font-medium">
                    <Filter size={18} /> Filters
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wide">
                        <tr>
                            <th className="p-5">Student Info</th>
                            <th className="p-5">Class</th>
                            <th className="p-5">Type</th>
                            <th className="p-5">Health Status</th>
                            <th className="p-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredStudents.map(student => (
                            <tr key={student._id} className="hover:bg-slate-50/50 transition">
                                <td className="p-5">
                                    <div className="font-semibold text-slate-800">{student.fullName}</div>
                                    <div className="text-sm text-slate-500">{student.admissionNo}</div>
                                </td>
                                <td className="p-5 text-slate-600 font-medium">{student.class}</td>
                                <td className="p-5">
                                    <StudentTypeBadge type={student.studentType} />
                                </td>
                                <td className="p-5">
                                    {(student.allergies || student.chronicCondition) && (student.allergies !== 'None' || student.chronicCondition !== 'None') ? (
                                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-fit">
                                            <AlertTriangle size={16} />
                                            <span className="text-xs font-semibold">Alert</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-medium px-2 py-1">No Alerts</span>
                                    )}
                                </td>
                                <td className="p-5 text-right space-x-2 flex justify-end items-center">
                                    {user.role === 'ADMIN' && (
                                        <>
                                            <button 
                                                onClick={() => handleEdit(student)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(student._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                    <Link 
                                        to={`/students/${student._id}`} 
                                        className="text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-indigo-500/20 shadow-md"
                                    >
                                        Profile
                                    </Link>
                                    {user.role === 'NURSE' && (
                                        <Link 
                                            to={`/visits/new?studentId=${student._id}`} 
                                            className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium transition shadow-emerald-500/20 shadow-md"
                                        >
                                            Record Visit
                                        </Link>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Search size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-medium text-slate-500">No students found</p>
                                        <p className="text-sm">Try adjusting your search terms</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <AddStudentModal 
                    onClose={() => {
                        setShowAddModal(false);
                        setStudentToEdit(null);
                    }}
                    onStudentAdded={() => {
                        fetchStudents();
                    }}
                    studentToEdit={studentToEdit}
                />
            )}
        </div>
    );
};

export default StudentList;
