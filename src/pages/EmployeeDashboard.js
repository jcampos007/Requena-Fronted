import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../App.css';  // Ruta corregida

const API_BASE_URL =
    window.location.hostname.includes('localhost') ||
    window.location.hostname.startsWith('192.168.')
        ? 'http://192.168.1.101:3001'
        : 'https://requena-backend-production.up.railway.app';


const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasCheckedOut, setHasCheckedOut] = useState(false);

  const [vacationDays, setVacationDays] = useState(0);
  const [usedDates, setUsedDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
      loadInitialData(storedUser.id);
    }
  }, [navigate]);

  const loadInitialData = async (userId) => {
    try {
      await Promise.all([
        fetchVacationDays(userId),
        checkIfCheckedIn(userId),
        checkIfCheckedOut(userId),
        fetchUsedDates(userId)
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const checkIfCheckedIn = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/checkIn-status`);
    const data = await response.json();
    setHasCheckedIn(data.checkedIn);
  };

  const checkIfCheckedOut = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/checkOut-status`);
    const data = await response.json();
    setHasCheckedOut(data.alreadyCheckedOut);
  };

  const fetchVacationDays = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/vacation-days`);
    const data = await response.json();
    setVacationDays(data.vacation_days);
  };

  const fetchUsedDates = async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/vacation-history`);
    const data = await response.json();
    const blockedDates = data
        .filter(r => r.status === 'approved' || r.status === 'pending')
        .map(r => r.vacation_date);
    setUsedDates(blockedDates);
  };

  const handleCheck = async (type) => {
    setLoading(true);
    setLocationError(null);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      const endpoint = type === 'checkin' ? 'checkIn' : 'checkOut';
      await registerCheck(endpoint, user.id, latitude, longitude);
      type === 'checkin' ? setHasCheckedIn(true) : setHasCheckedOut(true);
      alert(`✅ ${type === 'checkin' ? 'Check-in' : 'Check-out'} registrado`);
    } catch (error) {
      handleCheckError(error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      });
    });
  };

  const registerCheck = async (endpoint, userId, lat, lng) => {
    const response = await fetch(`${API_BASE_URL}/users/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, latitude: lat, longitude: lng }),
    });
    if (!response.ok) throw new Error('Error al registrar');
  };

  const handleCheckError = (error) => {
    console.error('Error:', error);
    const errorMessage = error.code === error.PERMISSION_DENIED
        ? 'Debes permitir acceso a ubicación'
        : 'Error al obtener ubicación';
    setLocationError(errorMessage);
  };

  const handleDateChange = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    setSelectedDates(prev =>
        prev.includes(dateStr)
            ? prev.filter(d => d !== dateStr)
            : [...prev, dateStr]
    );
  };

  const handleVacationRequest = async () => {
    if (selectedDates.length === 0) {
      alert('Debes seleccionar al menos un día');
      return;
    }

    setLoading(true);
    try {
      const sortedDates = [...selectedDates].sort();
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/vacation-request-grouped`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ dates: sortedDates }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error en la solicitud');

      setVacationDays(data.vacation_days);
      setUsedDates(prev => [...prev, ...sortedDates]);
      setSelectedDates([]);
      setShowCalendar(false);

      const dateRange = sortedDates.length === 1
          ? `el día ${sortedDates[0]}`
          : `desde ${sortedDates[0]} hasta ${sortedDates[sortedDates.length - 1]}`;
      alert(`✅ Solicitud enviada para ${sortedDates.length} días (${dateRange})`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tileDisabled = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split('T')[0];
    return usedDates.includes(dateStr) || date < today;
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (selectedDates.includes(dateStr)) {
        return 'vacation-day-selected';
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date.toDateString() === today.toDateString()) {
        return 'react-calendar__tile--now';
      }
    }
    return '';
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-red-600 p-4 text-white">
            <h1 className="text-2xl font-bold">Bienvenido, {user.name}</h1>
            <p className="mt-1 text-white font-medium">Días disponibles: {vacationDays}</p>
          </div>

          <div className="p-4 border-b">
            {!hasCheckedIn && !hasCheckedOut && (
                <CheckInButton loading={loading} onClick={() => handleCheck('checkin')} />
            )}
            {hasCheckedIn && !hasCheckedOut && (
                <CheckOutButton loading={loading} onClick={() => handleCheck('checkout')} />
            )}
            {locationError && (
                <p className="mt-2 text-red-500 text-sm">{locationError}</p>
            )}
          </div>

          <div className="p-4">
            <VacationRequestButton
                vacationDays={vacationDays}
                onClick={() => setShowCalendar(!showCalendar)}
            />

            {showCalendar && (
                <div className="mt-4">
                  <Calendar
                      onChange={handleDateChange}
                      value={selectedDates.map(date => new Date(date))}
                      tileDisabled={tileDisabled}
                      selectRange={false}
                      tileClassName={tileClassName}
                      className="custom-calendar"
                  />
                  {selectedDates.length > 0 && (
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-sm">Seleccionados: {selectedDates.length} días</span>
                        <div className="space-x-2">
                          <button
                              onClick={() => setSelectedDates([])}
                              className="px-3 py-1 bg-gray-200 rounded text-sm"
                          >
                            Limpiar
                          </button>
                          <button
                              onClick={handleVacationRequest}
                              disabled={loading}
                              className={`px-3 py-1 rounded text-sm text-white ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                          >
                            {loading ? 'Enviando...' : 'Enviar'}
                          </button>
                        </div>
                      </div>
                  )}
                </div>
            )}
          </div>

          <div className="p-4 bg-gray-100 flex justify-between">
            <button
                onClick={() => navigate('/employee/vacation-status')}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Ver Solicitudes
            </button>
            <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
  );
};

const CheckInButton = ({ loading, onClick }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`w-full py-2 rounded text-white font-medium ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
    >
      {loading ? 'Registrando...' : 'Registrar Check-in'}
    </button>
);

const CheckOutButton = ({ loading, onClick }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className={`w-full py-2 rounded text-white font-medium ${loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
    >
      {loading ? 'Registrando...' : 'Registrar Check-out'}
    </button>
);

const VacationRequestButton = ({ vacationDays, onClick }) => (
    <button
        onClick={onClick}
        disabled={vacationDays === 0}
        className={`w-full py-2 rounded font-medium text-white ${
            vacationDays > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
    >
      {vacationDays > 0 ? 'Solicitar Vacaciones' : 'Sin días disponibles'}
    </button>
);

export default EmployeeDashboard;