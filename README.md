# Task Manager App
Esta es una aplicación de gestión de tareas desarrollada con React Native en el front-end y Node.js con Express y MongoDB en el back-end.

# Funcionalidades
- **Registro:** Los usuarios pueden registrarse en la aplicación con su nombre, correo electrónico y contraseña.
- **Inicio de sesión:** Los usuarios pueden iniciar sesión en la aplicación con su correo electrónico y contraseña.
- **Recuperación de contraseña:** Los usuarios pueden restablecer su contraseña utilizando el correo electrónico registrado (no funcional al clonar debido a la necesidad de API KEY). 
- **Gestión de tareas:** Los usuarios pueden agregar, completar, marcar y eliminar tareas.
- **Gestión de categorías:** Los usuarios pueden filtrar tareas por categorías.
- **Gestión de subtareas:** Los usuarios pueden entrar a una vista de detalle en cada tarea, agregar notas y activar recordatorios.
- **Calendario:** Los usuarios pueden ver cuantas tareas han completado un día en concreto.
- **Perfil:** Los usuarios pueden ver una gráfica con tareas completadas y pendientes totales, sistema de logros por tareas hechas, posibilidad de cambiar foto de perfil y cierre de sesión.

# Instalación
``Importante tener actualizado ExpoGO a la versión 51``
## Para configurarlo localmente
### 1. Clona el repositorio desde GitHub y navega al directorio del proyecto:
- > git clone https://github.com/ExceptionPK/TasksAndAppointments.git
- > cd TasksAndAppointments


### 2. Realiza una instalación de dependencias en la carpeta raíz y la carpeta api del proyecto:
- > npm install
- > cd api > npm install

### 3. Ejecutar los servicios en la carpeta raíz del proyecto y en la carpeta api del proyecto:
- > npx expo start
- > cd api > npm start 

### 4. Al ejecutar `npx expo start`, reemplazar la IP en las solicitudes Axios por la generada en tu máquina en los siguientes archivos:
- app/(authenticate)/login.js
- app/(authenticate)/register.js
- app/(tabs)/calendar/index.js
- app/(tabs)/home/index.js
- app/(tabs)/profile/index.js

### Ejemplo
![](https://github.com/ExceptionPK/TasksAndAppointments/blob/main/2.PNG)
![](https://github.com/ExceptionPK/TasksAndAppointments/blob/main/1.PNG)

## Demo completamente funcional (instalar en un dispositivo Android)
https://tasksandapp.webcindario.com/

# Autor
**Pablo Kuzmin Mashkantsev**
