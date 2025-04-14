import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';
const EmployeeVacationStatus = () => {
    const [requests, setRequests] = useState([]);
    const [newNotifications, setNewNotifications] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const navigate = useNavigate();

    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch (e) {
            console.error('Error parsing user from localStorage:', e);
            return null;
        }
    });

    useEffect(() => {
        const controller = new AbortController();

        if (user) {
            fetchVacationRequests(controller.signal);
        }

        return () => controller.abort();
    }, [user]);

    const fetchVacationRequests = async (signal) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/users/${user.id}/grouped-vacation-requests`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                signal
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Ordenar solicitudes por fecha más reciente primero
            const sortedRequests = data.sort((a, b) =>
                new Date(b.startDate) - new Date(a.startDate)
            );

            setRequests(sortedRequests);
            updateNotificationCount(sortedRequests);
            setRetryCount(0);
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('⏹️ Petición abortada por desmontaje del componente.');
                return; // No mostramos error si fue por el AbortController
            }

            console.error('Error fetching vacation requests:', err);
            setError(err.message);

            if ((err.message.includes('Failed to fetch') || err.message.includes('ERR_INSUFFICIENT_RESOURCES')) && retryCount < 3) {
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchVacationRequests(signal);
                }, 5000);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateNotificationCount = (requestsData) => {
        const unread = requestsData.filter(req =>
            req.status !== 'pending' && !req.notificationRead
        ).length;
        setNewNotifications(unread);
    };

    const markAsRead = async (requestId) => {
        try {
            await fetch(`${API_BASE_URL}/users/mark-group-notification-read/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            const updatedRequests = requests.map(req =>
                req.groupId === requestId ? { ...req, notificationRead: true } : req
            );
            setRequests(updatedRequests);
            updateNotificationCount(updatedRequests);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatDateRange = (startDate, endDate) => {
        if (startDate === endDate) {
            return new Date(startDate).toLocaleDateString('es-ES');
        }
        return `${new Date(startDate).toLocaleDateString('es-ES')} al ${new Date(endDate).toLocaleDateString('es-ES')}`;
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/employee')}
                    className="w-10 h-10 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition flex-shrink-0 flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Estado de Solicitudes de Vacaciones</h1>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error al cargar solicitudes</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                                <button
                                    onClick={() => fetchVacationRequests()}
                                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-red-600 p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">Tus Solicitudes</h2>
                        {newNotifications > 0 && (
                            <span className="bg-white text-red-600 rounded-full px-3 py-1 text-sm font-medium">
                                {newNotifications} nueva(s)
                            </span>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando solicitudes...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No tienes solicitudes de vacaciones registradas.</p>
                        <button
                            onClick={() => fetchVacationRequests()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Refrescar
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-red-50">
                            <tr>
                                <th className="p-3 text-left text-red-600">Período</th>
                                <th className="p-3 text-left text-red-600">Días</th>
                                <th className="p-3 text-left text-red-600">Estado</th>
                                <th className="p-3 text-left text-red-600">Comentarios</th>
                                <th className="p-3 text-left text-red-600">Notificación</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests.map((request) => (
                                <tr
                                    key={request.groupId}
                                    className={`border-b ${
                                        !request.notificationRead && request.status !== 'pending'
                                            ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => !request.notificationRead && request.status !== 'pending' && markAsRead(request.groupId)}
                                >
                                    <td className="p-3 font-medium">
                                        {formatDateRange(request.startDate, request.endDate)}
                                    </td>
                                    <td className="p-3 text-center">
                                        {request.totalDays}
                                    </td>
                                    <td className="p-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {request.status === 'approved' ? 'Aprobado' :
                                                    request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                            </span>
                                    </td>
                                    <td className="p-3 text-sm text-gray-600">
                                        {request.comments || 'Sin comentarios'}
                                    </td>
                                    <td className="p-3">
                                            <span className={`text-xs font-medium ${
                                                request.notificationRead ? 'text-gray-500' : 'text-blue-600'
                                            }`}>
                                                {request.notificationRead ? 'Leído' : 'Nuevo'}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeVacationStatus;