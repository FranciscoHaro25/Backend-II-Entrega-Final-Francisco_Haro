# 🚀 Entrega N° 1 - Backend II | Sistema de Autenticación y Autorización

## 📋 Descripción General

Implementación completa de un **CRUD de usuarios** con **sistema de autenticación y autorización** usando:

- **Passport.js** con estrategias Local y GitHub OAuth
- **JWT (JSON Web Tokens)** para autenticación stateless
- **bcrypt.hashSync** para encriptación de contraseñas
- **MongoDB Atlas** como base de datos principal

## ✅ Aspectos Implementados según Consigna

### � Modelo de Usuario

Esquema `User` con **todos los campos requeridos**:

```javascript
{
  first_name: String,        // ✅ Nombre del usuario
  last_name: String,         // ✅ Apellido del usuario
  email: String,             // ✅ Email único e indexado
  age: Number,               // ✅ Edad del usuario
  password: String,          // ✅ Contraseña hasheada con bcrypt
  cart: ObjectId,            // ✅ Referencia a modelo Cart
  role: String               // ✅ Rol por defecto: 'user'
}
```

### 🔐 Encriptación de Contraseñas

- ✅ Implementado **bcrypt.hashSync** como especifica la consigna
- ✅ Salt rounds: 10 para seguridad óptima
- ✅ Validación de contraseñas con bcrypt.compare

### 🛡️ Estrategias de Passport

Configuradas **tres estrategias completas**:

1. **Local-Login**: Autenticación con email/password
2. **Local-Register**: Registro de nuevos usuarios
3. **JWT**: Validación de tokens para API REST
4. **GitHub OAuth**: Autenticación con GitHub (bonus)

### 🔑 Sistema de Login JWT

- ✅ **Login exitoso** genera token JWT válido
- ✅ **Tokens con expiración** de 24 horas
- ✅ **Payload completo** con datos del usuario
- ✅ **Autenticación stateless** para APIs

### 🎯 Ruta de Validación `/current`

**IMPLEMENTACIÓN COMPLETA** de `/api/sessions/current`:

- ✅ **Estrategia JWT** de Passport para validación
- ✅ **Extracción de token** desde cookies y Authorization header
- ✅ **Retorna datos completos** del usuario logueado
- ✅ **Manejo de errores** para tokens inválidos/expirados

## 🔧 Características Técnicas

### 🗃️ Base de Datos

- **MongoDB Atlas**: `integrative_practice`
- **Modelos**: User, Cart, Product
- **Índices optimizados** para consultas frecuentes
- **Validaciones robustas** en el esquema

### 🌐 API REST Completa

**Rutas de Sesiones** (`/api/sessions/`):

- `POST /login` - Login con JWT
- `POST /register` - Registro con JWT
- `GET /current` - **Validar usuario logueado** ⭐
- `POST /logout` - Cerrar sesión

**CRUD de Usuarios** (`/api/users/`):

- `GET /` - Obtener todos los usuarios
- `POST /` - Crear nuevo usuario
- `GET /:id` - Obtener usuario por ID
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Eliminar usuario## 🛠️ Stack Tecnológico

### Backend

- **Node.js** v18+ - Entorno de ejecución
- **Express.js** - Framework web minimalista
- **Passport.js** - Autenticación con múltiples estrategias
- **passport-local** - Estrategia de autenticación local
- **passport-jwt** - Estrategia JWT para APIs
- **passport-github2** - OAuth con GitHub
- **bcrypt** - Encriptación segura de contraseñas
- **jsonwebtoken** - Generación y validación de JWT

### Base de Datos

- **MongoDB Atlas** - Base de datos en la nube
- **Mongoose** - ODM para modelado elegante de MongoDB

### Sesiones & Middleware

- **express-session** - Manejo de sesiones HTTP
- **connect-mongo** - Almacenamiento de sesiones en MongoDB
- **cookie-parser** - Parser de cookies firmadas

### Frontend

- **Handlebars.js** - Motor de plantillas lógico
- **Bootstrap 5** - Framework CSS responsivo
- **Font Awesome** - Iconografía moderna

## 📁 Estructura del Proyecto

```
practica-1/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración MongoDB Atlas
│   │   ├── db.js           # Conexión y modelos
│   │   └── passport.js     # Estrategias de autenticación ⭐
│   ├── middleware/
│   │   └── auth.js         # Middlewares de protección
│   ├── models/
│   │   ├── User.js         # Modelo Usuario (Consigna) ⭐
│   │   ├── Cart.js         # Modelo Carrito
│   │   └── Product.js      # Modelo Producto
│   ├── routes/
│   │   ├── api-sessions.js # API Sessions (/api/sessions) ⭐
│   │   ├── api-users.js    # CRUD Usuarios (/api/users)
│   │   ├── auth.js         # Autenticación web (/auth)
│   │   ├── products.js     # Productos (/products)
│   │   ├── users-views.js  # Vistas JWT (/users)
│   │   └── views.js        # Vistas principales (/)
│   ├── services/
│   │   └── userService.js  # Lógica de negocio usuarios
│   ├── utils/
│   │   └── auth.js         # Utilidades de autenticación
│   ├── views/
│   │   ├── layouts/
│   │   │   └── main.hbs    # Layout base responsivo
│   │   ├── current-user.hbs # Usuario actual (JWT)
│   │   ├── jwt-login.hbs   # Login JWT
│   │   ├── login.hbs       # Login Passport
│   │   ├── register.hbs    # Registro de usuario
│   │   ├── products.hbs    # Catálogo de productos
│   │   └── error.hbs       # Página de errores
│   └── app.js              # Servidor principal Express
├── .env                    # Variables de entorno
├── package.json           # Dependencias del proyecto
└── README.md              # Documentación completa
```

## � Instalación y Ejecución

### 📋 Prerrequisitos

- **Node.js v18+**
- **MongoDB Atlas** (configurado)
- **Git** para clonar el repositorio

### ⚡ Instalación Rápida

```bash
# 1. Clonar repositorio
git clone <url-del-repositorio>
cd practica-1

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar aplicación
npm start
```

### 🌐 Acceso

- **Aplicación Web**: `http://localhost:3000`
- **API REST**: `http://localhost:3000/api`
- **Documentación**: Este README

### 🔐 Variables de Entorno Requeridas

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# GitHub OAuth (opcional)
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

# Express Session
SESSION_SECRET=tu_session_secret
```

## 🧪 Pruebas y Credenciales

### 👨‍💼 Usuario Administrador (Pre-creado)

```
Email: admincoder@coder.com
Password: admin123
Role: admin
```

### 👤 Crear Usuario Normal

Cualquier email válido + contraseña 6+ caracteres → Role: user

### 🔍 Probar API con curl/Postman

**1. Login y obtener JWT:**

```bash
curl -X POST http://localhost:3000/api/sessions/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admincoder@coder.com", "password": "admin123"}'
```

**2. Validar usuario con JWT:**

```bash
curl -X GET http://localhost:3000/api/sessions/current \
  -H "Authorization: Bearer <tu-jwt-token>"
```

**3. Registrar nuevo usuario:**

```bash
curl -X POST http://localhost:3000/api/sessions/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan@example.com",
    "password": "juan123",
    "age": 25
  }'
```

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

## ✅ Cumplimiento de Consigna - Entrega N° 1

### 📊 Modelo de Usuario y Encriptación

- ✅ **Modelo User completo** con todos los campos especificados
- ✅ **Encriptación bcrypt.hashSync** implementada correctamente
- ✅ **Contraseñas hasheadas** almacenadas de forma segura
- ✅ **Campo cart** con referencia a modelo Cart

### 🛡️ Estrategias de Passport

- ✅ **Estrategia Local-Login** configurada para autenticación
- ✅ **Estrategia Local-Register** para registro de usuarios
- ✅ **Estrategia JWT** implementada para validación de tokens
- ✅ **Configuración completa** en `src/config/passport.js`

### 🔑 Sistema de Login JWT

- ✅ **Tokens JWT válidos** generados en login exitoso
- ✅ **Autenticación stateless** funcionando correctamente
- ✅ **Payload completo** con datos del usuario
- ✅ **Expiración configurada** (24 horas)

### 🎯 Endpoint /api/sessions/current

- ✅ **Ruta implementada** en `/api/sessions/current`
- ✅ **Estrategia "current"** (JWT) validando usuarios
- ✅ **Extracción correcta** de datos del token
- ✅ **Manejo de errores** para tokens inválidos
- ✅ **Respuesta completa** con datos del usuario logueado

## 🎓 Notas Académicas

**Entrega Backend II - CoderHouse**  
**Tema**: CRUD de Usuarios + Autenticación y Autorización  
**Tecnologías**: Node.js, Express, Passport.js, JWT, MongoDB Atlas, bcrypt

### 🔗 Link del Repositorio

```
https://github.com/tu-usuario/backend-ii-entrega-1
```

### 📱 Funcionalidades Extra Implementadas

- GitHub OAuth como método alternativo de autenticación
- Interfaz web completa con Bootstrap 5
- Validaciones robustas en frontend y backend
- Sistema de roles con middleware de autorización
- API REST completa para gestión de usuarios

---

**Desarrollado por**: [Tu Nombre]  
**Curso**: Backend II - CoderHouse  
**Entrega**: N° 1 - Sistema de Autenticación y Autorización
