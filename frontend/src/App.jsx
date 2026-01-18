import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import StudentList from './pages/StudentList';
import StudentProfile from './pages/StudentProfile';
import NewVisitForm from './pages/NewVisitForm';
import StaffList from './pages/StaffList';
import AdminNotifications from './pages/AdminNotifications';
import NurseDashboard from './pages/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ClinicVisitReview from './pages/ClinicVisitReview';
import SingleVisit from './pages/SingleVisit';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

    return children;
};

const AppRoutes = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={
                    user?.role === 'ADMIN' ? <AdminDashboard /> : 
                    user?.role === 'DOCTOR' ? <DoctorDashboard /> :
                    <NurseDashboard />
                } />
                <Route path="students" element={<StudentList />} />
                <Route path="students/:id" element={<StudentProfile />} />
                <Route path="nurses" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <StaffList />
                    </ProtectedRoute>
                } />
                <Route path="notifications" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminNotifications />
                    </ProtectedRoute>
                } />
                <Route path="visits/new" element={
                    <ProtectedRoute allowedRoles={['NURSE']}>
                        <NewVisitForm />
                    </ProtectedRoute>
                } />
                <Route path="visits/:id/review" element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'NURSE']}>
                         <ClinicVisitReview />
                    </ProtectedRoute>
                } />
                <Route path="visits/:id" element={
                    <ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN', 'NURSE']}>
                         <SingleVisit />
                    </ProtectedRoute>
                } />
            </Route>
            
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
