# RegistroApp

Aplicación desarrollada en Ionic Framework convertida a Android usando Capacitor
Por Ricardo Carrión V.

## Cómo ejecutar el proyecto

1. Instalar dependencias:
   ```
   npm install
   ```

2. Ejecutar la aplicación:
   ```
   npx ionic serve
   ```

La app se abrirá en el navegador en `http://localhost:8100`

## 📱 Conversión a Android

### Pasos realizados para convertir la app Ionic a Android:

1. **Instalar Capacitor:**
   ```
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Inicializar Capacitor:**
   ```
   npx cap init
   ```

3. **Generar build de la app:**
   ```
   ionic build
   ```

4. **Agregar plataforma Android:**
   ```
   npx cap add android
   ```
   Este comando creó automáticamente la carpeta `android/`

5. **Modificar AndroidManifest.xml:**
   - Edité el archivo para permitir conexiones de internet
   - Agregué los permisos necesarios para conectividad

6. **Generar APK:**
   - Abrí Android Studio
   - Abrí el proyecto desde la carpeta `android/`
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

## 📁 Archivos importantes

- `src/` - Código fuente de la aplicación Ionic
- `android/` - Proyecto Android nativo generado por Capacitor
- `ionic.config.json` - Configuración de Ionic
- `capacitor.config.ts` - Configuración de Capacitor
