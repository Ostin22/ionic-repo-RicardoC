export interface User {
  record: number;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
}

export interface AttendanceRecord {
  record: number;
  date: string;
  time: string;
  join_date: string;
}

const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = 'https://puce.estudioika.com/api/examen.php';

export class ApiService {
  static async authenticateUser(user: string, pass: string): Promise<User | null> {
    try {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('user', user);
      url.searchParams.append('pass', pass);

      const response = await fetch(CORS_PROXY + url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Si la API devuelve un array con un usuario, retornamos el primer elemento
      if (Array.isArray(data) && data.length > 0) {
        return data[0] as User;
      }
      
      // Si la API devuelve un objeto directamente
      if (data && typeof data === 'object' && data.record) {
        return data as User;
      }

      // Si no hay datos válidos, retornamos null
      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw new Error('Error de conexión. Por favor, intente nuevamente.');
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(CORS_PROXY + API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Error de conexión. Por favor, intente nuevamente.');
    }
  }

  static async registerAttendance(recordUser: number, joinUser: number): Promise<boolean> {
    try {
      console.log('Registering attendance with:', { recordUser, joinUser });

      const requestBody = {
        record_user: recordUser,
        join_user: joinUser
      };

      console.log('POST Body:', JSON.stringify(requestBody));
      console.log('POST URL:', API_BASE_URL);
      console.log('Full POST URL with CORS:', CORS_PROXY + API_BASE_URL);

      const response = await fetch(CORS_PROXY + API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('POST Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('POST Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('POST Response data:', data);
      
      // Verificar si el registro fue exitoso según la respuesta de la API
      return data && (data.success === true || data.status === 'success' || data.message);
    } catch (error) {
      console.error('Error registering attendance:', error);
      throw new Error('Error al registrar asistencia. Por favor, intente nuevamente.');
    }
  }

  static async getAttendanceRecords(recordUser: number): Promise<AttendanceRecord[]> {
    try {
      const url = new URL(API_BASE_URL);
      url.searchParams.append('record', recordUser.toString());

      console.log('GET Attendance URL:', url.toString());
      console.log('Full URL with CORS:', CORS_PROXY + url.toString());

      const response = await fetch(CORS_PROXY + url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Attendance records response:', data);
      
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw new Error('Error al obtener registros de asistencia. Por favor, intente nuevamente.');
    }
  }
}