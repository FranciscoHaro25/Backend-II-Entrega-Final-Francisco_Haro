# Backend II - Primera Entrega 🚀

**Estudiante:** Francisco Haro  
**Comisión:** Backend II - CoderHouse  
**Fecha:** Noviembre 2025

---

## 📋 Descripción

Sistema de autenticación y autorización implementado según la consigna de la Primera Entrega. Incluye CRUD de usuarios, login con JWT y todas las funcionalidades requeridas.

## ⚡ Tecnologías

- **Node.js** + Express.js
- **MongoDB** con Mongoose
- **Passport.js** (estrategias Local y JWT)
- **bcrypt** para encriptación
- **JWT** para autenticación
- **Handlebars** para vistas

## 🔧 Instalación

```bash
npm install
npm start
```

## 📝 Modelo de Usuario

Implementa **TODOS** los campos requeridos por la consigna:

```javascript
{
  first_name: String,
  last_name: String,
  email: String,        // único
  age: Number,
  password: String,     // encriptado con bcrypt.hashSync
  cart: ObjectId,       // referencia a Cart
  role: String         // default: 'user'
}
```

## 🛠️ Funcionalidades Implementadas

### ✅ Encriptación de Contraseñas

- Uso de `bcrypt.hashSync()` como especifica la consigna
- Salt rounds: 10

### ✅ Estrategias de Passport

- **Local Login:** Validación email/password
- **Local Register:** Registro de usuarios
- **JWT:** Validación de tokens para rutas protegidas

### ✅ Sistema de Login JWT

- Generación automática de tokens tras login exitoso
- Expiración: 24 horas
- Payload completo con datos del usuario

### ✅ Ruta /current (REQUERIDA)

- **Endpoint:** `GET /api/sessions/current`
- **Middleware:** `passport.authenticate("jwt")`
- **Función:** Valida JWT y devuelve datos del usuario
- **Manejo de errores:** Tokens inválidos retornan error apropiado

## 🔗 Endpoints Principales

### Sesiones

- `POST /api/sessions/login` - Login con JWT
- `POST /api/sessions/register` - Registro de usuario
- `GET /api/sessions/current` - **RUTA REQUERIDA POR CONSIGNA**
- `POST /api/sessions/logout` - Cerrar sesión

### Usuarios (CRUD)

- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 📂 Estructura del Proyecto

```
src/
├── app.js                 # Aplicación principal
├── config/
│   ├── db.js             # Conexión MongoDB
│   └── passport.js       # Estrategias de autenticación
├── models/
│   ├── User.js           # Modelo de Usuario (con todos los campos)
│   ├── Cart.js           # Modelo de Carrito
│   └── Product.js        # Modelo de Producto
├── routes/
│   ├── api-sessions.js   # Rutas de autenticación (/current aquí)
│   └── api-users.js      # CRUD de usuarios
└── middleware/
    └── auth.js           # Middleware de autenticación
```

## 🔐 Variables de Entorno

```env
MONGO_URL=mongodb+srv://...
JWT_SECRET=tu_jwt_secret
SESSION_SECRET=tu_session_secret
PORT=3000
```

## ✅ Cumplimiento de Consigna

| Requisito            | Estado | Implementación                |
| -------------------- | ------ | ----------------------------- |
| Modelo User completo | ✅     | `src/models/User.js`          |
| bcrypt.hashSync      | ✅     | Línea 93 en `api-sessions.js` |
| Estrategias Passport | ✅     | `src/config/passport.js`      |
| Sistema JWT          | ✅     | Login genera JWT válido       |
| Ruta /current        | ✅     | `GET /api/sessions/current`   |

---
