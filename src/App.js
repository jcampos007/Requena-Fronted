import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading para cargar los componentes solo cuando sean necesarios
const Login = React.lazy(() => import('./pages/Login'));
const Home = React.lazy(() => import('./pages/Home'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminCheckins = React.lazy(() => import('./pages/AdminCheckins'));
const AdminVacations = React.lazy(() => import('./pages/AdminVacations'));
const EmployeeDashboard = React.lazy(() => import('./pages/EmployeeDashboard'));
const EmployeeVacationStatus = React.lazy(() => import('./pages/EmployeeVacationStatus'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Función para obtener el usuario desde localStorage
const getUser = () => JSON.parse(localStorage.getItem('user'));

// Componente para proteger rutas
const ProtectedRoute = ({ element, allowedRoles }) => {
    const user = getUser();
    if (!user) return <Navigate to="/login" replace />;
    if (!allowedRoles.includes(user.role)) return <Navigate to="/home" replace />;
    return element;
};

// 🔒 Evita purgado de clases Tailwind en producción
const TailwindPreserver = () => (
    <div className="hidden">
        <div className="bg-requena-red text-white p-4 m-2 rounded-lg shadow-lg">Red</div>
        <div className="bg-blue-500 text-white text-xl">Blue</div>
        <div className="bg-green-500 p-2 rounded">Green</div>
        <div className="grid grid-cols-2 gap-4">Grid</div>
        <div className="text-sm font-bold italic underline">Text</div>
        <div className="bg-gray-100 text-gray-800 border border-gray-300">Neutral</div>
    </div>
);

const App = () => {
    return (
        <>
            <TailwindPreserver />
            <Router>
                <Suspense fallback={<div>Cargando...</div>}>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home />} />

                        {/* Rutas protegidas para administradores */}
                        <Route
                            path="/admin"
                            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />}
                        />
                        <Route
                            path="/admin/users"
                            element={<ProtectedRoute element={<AdminUsers />} allowedRoles={['admin']} />}
                        />
                        <Route
                            path="/admin/checkins"
                            element={<ProtectedRoute element={<AdminCheckins />} allowedRoles={['admin']} />}
                        />
                        <Route
                            path="/admin/vacations"
                            element={<ProtectedRoute element={<AdminVacations />} allowedRoles={['admin']} />}
                        />

                        {/* Rutas protegidas para empleados */}
                        <Route
                            path="/employee"
                            element={<ProtectedRoute element={<EmployeeDashboard />} allowedRoles={['employee']} />}
                        />
                        <Route
                            path="/employee/vacation-status"
                            element={<ProtectedRoute element={<EmployeeVacationStatus />} allowedRoles={['employee']} />}
                        />

                        {/* Ruta para páginas no encontradas */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </Router>
        </>
    );
};

export default App;