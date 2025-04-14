import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Configuración de iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';
const AdminCheckins = () => {
    // Iconos personalizados
    const checkInIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    const checkOutIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41]
    });

    const [activePosition, setActivePosition] = useState([19.4326, -99.1332]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [users, setUsers] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [checkinsMap, setCheckinsMap] = useState({});
    const navigate = useNavigate();

    // Función para formatear coordenadas
    const formatCoordinate = (coord) => {
        if (coord === null || coord === undefined) return 'N/A';
        const num = Number(coord);
        return isNaN(num) ? coord : num.toFixed(4);
    };

    // Función mejorada para normalizar tipos de check
    const normalizeCheckType = (type) => {
        if (!type) return 'UNKNOWN';

        const typeStr = type.toString().toLowerCase().trim();

        if (typeStr.includes('checkin') || typeStr.includes('in')) return 'CHECKIN';
        if (typeStr.includes('checkout') || typeStr.includes('out')) return 'CHECKOUT';

        return typeStr.toUpperCase();
    };

    // Función para filtrar por fechas
    const filterCheckinsByDate = (checkins) => {
        if (!startDate && !endDate) return checkins;

        return checkins.filter(check => {
            const checkDate = new Date(check.timestamp);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate + 'T23:59:59') : null;

            return (
                (!start || checkDate >= start) &&
                (!end || checkDate <= end)
            );
        });
    };

    // Obtener usuarios
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/users`);
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            setUsers(data.filter(user => user.role === 'employee'));
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    // Obtener checkins con procesamiento de datos
    const fetchCheckins = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            return;
        }

        try {
            let url = `${API_URL}/admin/user-checkins/${userId}`;
            if (startDate || endDate) {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error('Error al obtener historial');
            let data = await response.json();

            // Procesar datos para normalizar tipos y coordenadas
            data = data.map(item => ({
                ...item,
                type: normalizeCheckType(item.type),
                latitude: Number(item.latitude) || 0,
                longitude: Number(item.longitude) || 0
            }));

            setCheckinsMap(prev => ({ ...prev, [userId]: data }));
            setExpandedUser(userId);

            if (data.length > 0) {
                setActivePosition([data[0].latitude, data[0].longitude]);
            }
        } catch (error) {
            console.error('Error al obtener historial:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">

            <div className="flex items-center gap-4 mb-6">
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
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Check-ins y Check-outs</h1>
            </div>

            <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-2xl font-bold text-red-600 mb-6">Lista de Usuarios</h2>

                {/* Filtros de fecha */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Fecha Inicio:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Fecha Fin:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border px-3 py-2 rounded"
                        />
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                    <tr className="bg-red-600 text-white">
                        <th className="p-3 text-left">Nombre</th>
                        <th className="p-3 text-left">Correo</th>
                        <th className="p-3 text-left">Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <React.Fragment key={user.id}>
                            <tr className="border-b">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">
                                    <button
                                        onClick={() => fetchCheckins(user.id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                    >
                                        {expandedUser === user.id ? 'Ocultar Historial' : 'Ver Historial'}
                                    </button>
                                </td>
                            </tr>
                            {expandedUser === user.id && (
                                <tr>
                                    <td colSpan="3" className="bg-gray-50 p-4">
                                        <h3 className="text-lg font-semibold mb-4">Historial</h3>
                                        {checkinsMap[user.id]?.length === 0 ? (
                                            <p>No hay registros para este usuario.</p>
                                        ) : (
                                            <>
                                                <div className="mb-4">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                        <tr className="bg-red-600 text-white">
                                                            <th className="p-2 text-left">Fecha y Hora</th>
                                                            <th className="p-2 text-left">Tipo</th>
                                                            <th className="p-2 text-left">Ubicación</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {filterCheckinsByDate(checkinsMap[user.id]).map((c) => {
                                                            const isCheckIn = c.type === 'CHECKIN';
                                                            const rowClass = isCheckIn ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100';

                                                            return (
                                                                <tr
                                                                    key={`${user.id}-${c.timestamp}`}
                                                                    className={`border-b cursor-pointer ${rowClass}`}
                                                                    onClick={() => setActivePosition([c.latitude, c.longitude])}
                                                                >
                                                                    <td className="p-2">{new Date(c.timestamp).toLocaleString()}</td>
                                                                    <td className="p-2 font-semibold">
                                        <span className={isCheckIn ? 'text-green-600' : 'text-red-600'}>
                                          {c.type}
                                        </span>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        {formatCoordinate(c.latitude)}, {formatCoordinate(c.longitude)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="h-96 w-full rounded-lg overflow-hidden">
                                                    <MapContainer
                                                        center={activePosition}
                                                        zoom={14}
                                                        className="h-full w-full"
                                                        key={`map-${user.id}-${startDate}-${endDate}`}
                                                    >
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        {filterCheckinsByDate(checkinsMap[user.id]).map((c) => {
                                                            const isCheckIn = c.type === 'CHECKIN';
                                                            const icon = isCheckIn ? checkInIcon : checkOutIcon;

                                                            return (
                                                                <Marker
                                                                    key={`marker-${user.id}-${c.timestamp}`}
                                                                    position={[c.latitude, c.longitude]}
                                                                    icon={icon}
                                                                >
                                                                    <Popup>
                                                                        <div className="text-sm">
                                                                            <p className={`font-bold ${isCheckIn ? 'text-green-600' : 'text-red-600'}`}>
                                                                                {c.type}
                                                                            </p>
                                                                            <p>{new Date(c.timestamp).toLocaleString()}</p>
                                                                            <p>
                                                                                Lat: {formatCoordinate(c.latitude)},
                                                                                Lng: {formatCoordinate(c.longitude)}
                                                                            </p>
                                                                        </div>
                                                                    </Popup>
                                                                </Marker>
                                                            );
                                                        })}
                                                    </MapContainer>
                                                </div>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCheckins;




