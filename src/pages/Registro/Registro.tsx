import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonButton,
  IonText,
  IonInput,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonAlert,
  IonLoading
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ApiService, User, AttendanceRecord } from '../../services/apiService';
import './Registro.css';

const Registro: React.FC = () => {
  const [digitoUno, setDigitoUno] = useState<number>(0);
  const [digitoDos, setDigitoDos] = useState<number>(0);
  const [inputUno, setInputUno] = useState<string>('');
  const [inputDos, setInputDos] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [registros, setRegistros] = useState<AttendanceRecord[]>([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const history = useHistory();

  // Función para generar posiciones aleatorias basadas en la longitud de la cédula
  const generarDigitosAleatorios = (cedula: string) => {
    const longitud = cedula.length;
    const posicion1 = Math.floor(Math.random() * longitud) + 1; // Posición 1-based
    const posicion2 = Math.floor(Math.random() * longitud) + 1; // Posición 1-based
    setDigitoUno(posicion1);
    setDigitoDos(posicion2);
  };

  // Cargar datos del usuario y generar dígitos al cargar la página
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData) as User;
      setCurrentUser(user);
      generarDigitosAleatorios(user.id);
    } else {
      // Si no hay usuario logueado, redirigir al login
      history.push('/login');
    }
  }, [history]);

  // Cargar registros cuando el usuario esté disponible
  useEffect(() => {
    if (currentUser) {
      loadAttendanceRecords();
    }
  }, [currentUser]);

  // Cargar registros de asistencia
  const loadAttendanceRecords = async () => {
    if (!currentUser) return;
    
    console.log('Loading attendance records for record:', currentUser.record);
    
    try {
      const records = await ApiService.getAttendanceRecords(currentUser.record);
      console.log('Loaded records:', records);
      setRegistros(records);
      setRegistrosFiltrados(records); // Inicialmente mostrar todos
    } catch (error) {
      console.error('Error loading attendance records:', error);
    }
  };

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    let filtrados = [...registros];

    if (filtroActivo === 'rango' && fechaInicio && fechaFin) {
      filtrados = filtrados.filter(registro => {
        const fechaRegistro = new Date(registro.date);
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        return fechaRegistro >= inicio && fechaRegistro <= fin;
      });
    } else if (filtroActivo === 'hoy') {
      const hoy = new Date().toISOString().split('T')[0];
      filtrados = filtrados.filter(registro => registro.date === hoy);
    } else if (filtroActivo === 'semana') {
      const hoy = new Date();
      const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
      const finSemana = new Date(hoy.setDate(inicioSemana.getDate() + 6));
      filtrados = filtrados.filter(registro => {
        const fechaRegistro = new Date(registro.date);
        return fechaRegistro >= inicioSemana && fechaRegistro <= finSemana;
      });
    } else if (filtroActivo === 'mes') {
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = hoy.getMonth();
      filtrados = filtrados.filter(registro => {
        const fechaRegistro = new Date(registro.date);
        return fechaRegistro.getFullYear() === año && fechaRegistro.getMonth() === mes;
      });
    }

    setRegistrosFiltrados(filtrados);
  };

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    aplicarFiltros();
  }, [filtroActivo, fechaInicio, fechaFin, registros]);

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltroActivo('todos');
    setFechaInicio('');
    setFechaFin('');
    setRegistrosFiltrados(registros);
  };

  const handleRegistro = async () => {
    if (!currentUser) {
      setAlertMessage('Error: No se encontraron datos del usuario');
      setShowAlert(true);
      return;
    }

    // Validar que los dígitos ingresados coincidan con la cédula
    const cedula = currentUser.id;
    const digitoCorrecto1 = cedula.charAt(digitoUno - 1); // Convertir a 0-based
    const digitoCorrecto2 = cedula.charAt(digitoDos - 1); // Convertir a 0-based

    if (inputUno !== digitoCorrecto1 || inputDos !== digitoCorrecto2) {
      setAlertMessage(`Los dígitos ingresados no coinciden con su cédula.\nDígito ${digitoUno} debe ser: ${digitoCorrecto1}\nDígito ${digitoDos} debe ser: ${digitoCorrecto2}`);
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Registrar asistencia con POST
      const success = await ApiService.registerAttendance(currentUser.record, currentUser.record);
      
      if (success) {
        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString('es-EC');
        const horaStr = fecha.toLocaleTimeString('es-EC');
        
        setAlertMessage(`¡Asistencia registrada exitosamente!\nFecha: ${fechaStr}\nHora: ${horaStr}`);
        setShowAlert(true);
        
        // Recargar la lista de asistencias
        await loadAttendanceRecords();
        
        // Limpiar inputs y generar nuevos dígitos
        setInputUno('');
        setInputDos('');
        generarDigitosAleatorios(currentUser.id);
      } else {
        setAlertMessage('Error al registrar la asistencia. Intente nuevamente.');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : 'Error de conexión');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#28a745', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" style={{ '--color': '#ffffff' }} />
          </IonButtons>
          <IonTitle style={{ '--color': '#ffffff' }}>Registro de Asistencia</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="registro-content">
        <div className="registro-container">
          {/* Info del usuario */}
          <IonCard className="user-card">
            <IonCardContent>
              <div className="user-info">
                <div className="logo-container">
                  <div className="logo-circle">
                    <div className="logo-inner-circle"></div>
                    <div className="logo-dot"></div>
                  </div>
                </div>
                <div className="user-details">
                  <h3>Bienvenido</h3>
                  <p><strong>{currentUser ? `${currentUser.names} ${currentUser.lastnames}` : 'Cargando...'}</strong></p>
                  <p>Cédula: {currentUser?.id || 'Cargando...'}</p>
                  <p>Fecha y hora: {new Date().toLocaleString('es-EC')}</p>
                  <p>Para registrar su asistencia ingrese los dígitos de su cédula</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Registro de dígitos */}
          <IonCard className="digitos-card">
            <IonCardContent>
              <div className="digito-box">
                <label className="digito-label">Dígito {digitoUno}:</label>
                <input
                  type="number"
                  value={inputUno}
                  onChange={(e) => setInputUno(e.target.value)}
                  maxLength={1}
                  className="digito-input"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > 1) {
                      target.value = target.value.slice(0, 1);
                    }
                  }}
                />
              </div>
              
              <div className="digito-box">
                <label className="digito-label">Dígito {digitoDos}:</label>
                <input
                  type="number"
                  value={inputDos}
                  onChange={(e) => setInputDos(e.target.value)}
                  maxLength={1}
                  className="digito-input"
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.value.length > 1) {
                      target.value = target.value.slice(0, 1);
                    }
                  }}
                />
              </div>

              <button
                onClick={handleRegistro}
                className="registro-button"
                disabled={!inputUno || !inputDos || isLoading}
              >
                REGISTRAR
              </button>
            </IonCardContent>
          </IonCard>

          {/* Tabla de registros */}
          <IonCard className="tabla-card">
            <IonCardContent>
              <div className="tabla-header">
                <h4>Historial de Registros ({registrosFiltrados.length} de {registros.length})</h4>
              </div>

              {/* Filtros */}
              <div className="filtros-container">
                <div className="filtros-row">
                  <div className="filtro-botones">
                    <button 
                      className={`filtro-btn ${filtroActivo === 'todos' ? 'active' : ''}`}
                      onClick={() => setFiltroActivo('todos')}
                    >
                      Todos
                    </button>
                    <button 
                      className={`filtro-btn ${filtroActivo === 'hoy' ? 'active' : ''}`}
                      onClick={() => setFiltroActivo('hoy')}
                    >
                      Hoy
                    </button>
                    <button 
                      className={`filtro-btn ${filtroActivo === 'semana' ? 'active' : ''}`}
                      onClick={() => setFiltroActivo('semana')}
                    >
                      Esta Semana
                    </button>
                    <button 
                      className={`filtro-btn ${filtroActivo === 'mes' ? 'active' : ''}`}
                      onClick={() => setFiltroActivo('mes')}
                    >
                      Este Mes
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="tabla-container">
                <table className="registros-tabla">
                  <thead>
                    <tr>
                      <th>Record</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Fecha y Hora Completa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="no-data">
                          {registros.length === 0 ? 'No hay registros' : 'No hay registros que coincidan con los filtros'}
                        </td>
                      </tr>
                    ) : (
                      registrosFiltrados.map((registro, index) => (
                        <tr key={`${registro.record}-${index}`}>
                          <td>{registro.record}</td>
                          <td>{registro.date}</td>
                          <td>{registro.time}</td>
                          <td>{registro.join_date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading
          isOpen={isLoading}
          message="Registrando asistencia..."
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Información"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Registro;