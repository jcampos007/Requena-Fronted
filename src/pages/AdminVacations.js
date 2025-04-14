import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';
const AdminVacations = () => {
    const [groupedRequests, setGroupedRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState({});
    const navigate = useNavigate();

    const fetchGroupedRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/grouped-vacation-requests`);
            const data = await response.json();
            setGroupedRequests(data);
        } catch (error) {
            console.error('Error fetching grouped requests:', error);
            alert('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupedRequests();
    }, []);

    const handleGroupStatusChange = async (groupId, status) => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/admin/vacation-request-group/${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    comments: comments[groupId] || ''
                }),
            });

            if (response.ok) {
                // Actualización optimista
                setGroupedRequests(prev => prev.map(group =>
                    group.groupId === groupId
                        ? { ...group, status, comments: comments[groupId] || '' }
                        : group
                ));

                // Recarga para consistencia con backend
                await fetchGroupedRequests();

                alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
            }
        } catch (error) {
            console.error('Error updating group:', error);
            alert('Error al actualizar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex items-center mb-6 gap-4">
                <button
                    onClick={() => navigate('/admin')}
                    className="w-10 h-10 rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition flex-shrink-0"
                >
                    <svg
                        className="w-5 h-5 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <h1 className="text-3xl font-bold text-gray-800">Gestión de Vacaciones</h1>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-requena-red p-4">
                    <h2 className="text-xl font-semibold text-white">Solicitudes Agrupadas</h2>
                </div>

                {loading && <div className="p-4 text-center">Cargando...</div>}

                <table className="w-full">
                    <thead className="bg-red-50">
                    <tr>
                        <th className="p-3 text-left">Empleado</th>
                        <th className="p-3 text-left">Rango</th>
                        <th className="p-3 text-left">Días</th>
                        <th className="p-3 text-left">Estado</th>
                        <th className="p-3 text-left">Comentarios</th>
                        <th className="p-3 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {groupedRequests.map(group => (
                        <tr key={group.groupId} className={`border-b ${
                            group.status === 'pending' ? 'bg-white' : 'bg-gray-50'
                        }`}>
                            {/* Campos de datos */}
                            <td className="p-3">{group.userName}</td>
                            <td className="p-3">
                                {group.startDate === group.endDate
                                    ? group.startDate
                                    : `${group.startDate} al ${group.endDate}`}
                            </td>
                            <td className="p-3 text-center">{group.totalDays}</td>
                            <td className="p-3">
                                <StatusBadge status={group.status} />
                            </td>

                            <td className="p-3">
                                {group.status === 'pending' ? (
                                    <textarea
                                        value={comments[group.groupId] || ''}
                                        onChange={(e) =>
                                            setComments((prev) => ({
                                                ...prev,
                                                [group.groupId]: e.target.value,
                                            }))
                                        }
                                        className="w-full p-2 border rounded-md text-sm"
                                        placeholder="Agrega un comentario"
                                    />
                                ) : (
                                    <span>{group.comments || 'Ninguno'}</span>
                                )}
                            </td>

                            <td className="p-3">
                                {group.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleGroupStatusChange(group.groupId, 'approved')}
                                            className="btn-approve"
                                            disabled={loading}
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleGroupStatusChange(group.groupId, 'rejected')}
                                            className="btn-reject"
                                            disabled={loading}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="text-gray-500">Resuelto</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Componentes auxiliares
const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs";

    if (status === 'approved') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Aprobado</span>;
    }
    if (status === 'rejected') {
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rechazado</span>;
    }
    return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pendiente</span>;
};

export default AdminVacations;