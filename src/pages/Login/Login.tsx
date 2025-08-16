import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText,
  IonAlert,
  IonLoading
} from '@ionic/react';
import { person, lockClosed } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { ApiService } from '../../services/apiService';
import './Login.css';

const Login: React.FC = () => {
  const [usuario, setUsuario] = useState<string>('');
  const [contrasena, setContrasena] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const history = useHistory();

  const handleLogin = async () => {
    if (!usuario || !contrasena) {
      setAlertMessage('Por favor, ingrese usuario y contraseña');
      setShowAlert(true);
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = await ApiService.authenticateUser(usuario, contrasena);
      
      if (userData) {
        // Guardar datos del usuario en localStorage para usar en la página de registro
        localStorage.setItem('currentUser', JSON.stringify(userData));
        history.push('/registro');
      } else {
        setAlertMessage('Usuario o contraseña incorrectos');
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
      <IonContent className="login-content">
        <div className="login-container">
          <IonCard className="login-card">
            <IonCardContent>
              {/* Logo/Icono */}
              <div className="logo-container">
                <div className="logo-circle">
                  <div className="logo-inner-circle"></div>
                  <div className="logo-dot"></div>
                </div>
              </div>

              {/* Título */}
              <div className="title-container">
                <h2>Registro de Asistencia</h2>
              </div>

              {/* Formulario */}
              <div className="custom-input-container">
                <div className="custom-input-wrapper">
                  <IonIcon icon={person} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    className="custom-input"
                  />
                </div>
              </div>

              <div className="custom-input-container">
                <div className="custom-input-wrapper">
                  <IonIcon icon={lockClosed} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="custom-input"
                  />
                </div>
              </div>

              {/* Botón de Login */}
              <IonButton
                expand="block"
                onClick={handleLogin}
                className="login-button"
                disabled={!usuario || !contrasena || isLoading}
              >
                Ingresar
              </IonButton>

              {/* Link de registro */}
              

              {/* Texto inferior */}
              <div className="footer-text">
                <IonText color="medium">
                  <small>Por su seguridad, NO comparta su usuario y clave con terceros</small>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading
          isOpen={isLoading}
          message="Verificando credenciales..."
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

export default Login;