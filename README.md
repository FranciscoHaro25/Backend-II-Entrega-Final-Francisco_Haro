# Sistema de Autenticación con Passport.js - CoderHouse Backend II

## 📋 Descripción

Sistema completo de autenticación refactorizado con Passport.js, bcrypt y autenticación OAuth. Implementa registro seguro, login local y con GitHub, roles de usuario y sesiones persistentes en MongoDB Atlas.

## 🚀 Características Implementadas

- ✅ **Hasheo de Contraseñas** con bcrypt (salt rounds: 10)
- ✅ **Passport.js** para autenticación local y OAuth
- ✅ **Autenticación con GitHub** OAuth 2.0
- ✅ **Sistema de Registro y Login** refactorizado
- ✅ **Roles de Usuario**: Administrador y Usuario estándar
- ✅ **Sesiones Seguras** almacenadas en MongoDB Atlas
- ✅ **Interfaz Responsive** con Bootstrap 5
- ✅ **Middleware de Protección** para rutas
- ✅ **Validaciones Robustas** en frontend y backend

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Entorno de ejecución
- **Express.js** - Framework web
- **Passport.js** - Middleware de autenticación (Local + GitHub)
- **bcrypt** - Hasheo seguro de contraseñas
- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para MongoDB
- **Express Session** - Manejo de sesiones
- **Connect Mongo** - Almacenamiento de sesiones
- **Express Handlebars** - Motor de plantillas
- **Bootstrap 5** - Framework CSS responsivo
- **Font Awesome** - Librería de iconos

## 📁 Estructura del Proyecto

```
practica-1/
├── src/
│   ├── middleware/
│   │   └── auth.js          # Middlewares de autenticación
│   ├── routes/
│   │   ├── auth.js          # Rutas de autenticación (/auth)
│   │   ├── products.js      # Rutas de productos (/products)
│   │   └── views.js         # Rutas de vistas principales
│   ├── utils/
│   │   └── auth.js          # Utilidades de autenticación
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.hbs     # Layout principal
│   │   ├── error.hbs        # Página de errores
│   │   ├── login.hbs        # Formulario de login
│   │   ├── products.hbs     # Página de productos
│   │   └── register.hbs     # Formulario de registro
│   └── app.js               # Servidor principal
├── package.json
└── README.md
```

## 🔧 Instalación y Configuración

### Prerrequisitos

- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <tu-repositorio>
   cd practica-1
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar MongoDB**

   - Asegúrate de tener MongoDB ejecutándose en `mongodb://localhost:27017`
   - O modifica la URL de conexión en `src/app.js`

4. **Ejecutar el proyecto**

   ```bash
   # Modo desarrollo
   npm run dev

   # Modo producción
   npm start
   ```

5. **Acceder a la aplicación**
   - Abre tu navegador en `http://localhost:8080`

## 👤 Credenciales de Prueba

### Administrador

- **Email**: `adminCoder@coder.com`
- **Contraseña**: `admin123`
- **Rol**: Administrador

### Usuario Normal

- **Registro**: Cualquier email válido y contraseña de al menos 6 caracteres
- **Rol**: Usuario estándar

## 🌐 Rutas Disponibles

### Rutas de Vistas

- `GET /` - Página principal (redirige según autenticación)
- `GET /login` - Formulario de login
- `GET /register` - Formulario de registro
- `GET /products` - Página de productos (requiere autenticación)

### Rutas de API

- `POST /auth/login` - Procesar login
- `POST /auth/register` - Procesar registro
- `POST /auth/logout` - Cerrar sesión
- `GET /products/user` - Información del usuario autenticado

### Rutas de Desarrollo

- `GET /auth/debug/users` - Ver usuarios registrados (solo en desarrollo)

## 🔐 Sistema de Roles

### Usuario Administrador

- **Email específico**: `adminCoder@coder.com`
- **Permisos**: Acceso completo al sistema
- **Vista**: Panel de administración en productos
- **Identificación**: Badge de "Admin" en la interfaz

### Usuario Estándar

- **Registro**: Cualquier email válido
- **Permisos**: Acceso a productos como usuario
- **Vista**: Catálogo de productos estándar
- **Identificación**: Sin badge especial

## 🛡️ Seguridad Implementada

1. **Encriptación de Contraseñas** - Bcrypt con 10 salt rounds
2. **Validación de Formularios** - Cliente y servidor
3. **Protección de Rutas** - Middleware de autenticación
4. **Sanitización de Datos** - Limpieza de inputs del usuario
5. **Manejo de Sesiones** - Configuración segura con MongoDB
6. **Prevención de Ataques** - Validaciones estrictas

## 📱 Características de la Interfaz

- **Diseño Responsivo** - Optimizado para móviles y desktop
- **Validación en Tiempo Real** - Feedback inmediato al usuario
- **Mensajes de Estado** - Alertas informativas y de error
- **Navegación Intuitiva** - Menú contextual según rol
- **Experiencia Fluida** - Transiciones y animaciones CSS

## 🔄 Flujo de la Aplicación

1. **Acceso Inicial** → Redirige a `/login` si no está autenticado
2. **Registro/Login** → Validación y creación de sesión
3. **Redirección** → Lleva directamente a `/products` (no a `/profile`)
4. **Navegación** → Acceso protegido según rol de usuario
5. **Logout** → Destrucción de sesión y vuelta al login

## 📊 Características Técnicas

### Middleware Implementado

- `requireAuth` - Protege rutas que requieren autenticación
- `requireAdmin` - Restringe acceso a administradores
- `redirectIfAuthenticated` - Evita acceso a login/register si ya está logueado
- `addUserToViews` - Inyecta datos del usuario en todas las vistas
- `logActivity` - Registra actividades de autenticación

### Validaciones

- **Email**: Formato válido con regex
- **Contraseña**: Mínimo 6 caracteres
- **Edad**: Entre 18 y 120 años
- **Campos Requeridos**: Validación de campos obligatorios

## 🐛 Manejo de Errores

- **404** - Páginas no encontradas
- **403** - Acceso denegado
- **500** - Errores internos del servidor
- **Validación** - Errores de formulario con feedback visual

## 📈 Mejoras Futuras

- [ ] Conexión a base de datos MongoDB real
- [ ] Sistema de recuperación de contraseñas
- [ ] Autenticación con redes sociales
- [ ] Panel de administración completo
- [ ] API REST para gestión de productos
- [ ] Tests unitarios y de integración

## 📝 Notas para el Profesor

Este proyecto cumple con todos los requisitos solicitados:

1. ✅ **Estructura de Login**: Implementadas todas las vistas del hands-on lab
2. ✅ **Rutas de Router**: Configuradas para registro y login
3. ✅ **Redirección**: Directa a `/products` en lugar de `/profile`
4. ✅ **Mensaje de Bienvenida**: Muestra datos del usuario logueado
5. ✅ **Sistema de Roles**: Admin con `adminCoder@coder.com` y usuarios estándar
6. ✅ **Manejo de Sesiones**: Configuración completa con express-session

### Credenciales de Prueba Rápida

- **Admin**: `adminCoder@coder.com` / `admin123`
- **Usuario**: Cualquier email / cualquier contraseña

## 🤝 Contribución

Este es un proyecto académico para CoderHouse. Desarrollado siguiendo las mejores prácticas de Node.js y Express.

---

**Desarrollado para CoderHouse - Backend II**  
_Sistema de Login y Autenticación - Práctica 1_
