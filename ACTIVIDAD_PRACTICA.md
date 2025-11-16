# Actividad Práctica 3.4 - Refactor de Login

## ✅ Aspectos Implementados

### 1. Hasheo de contraseñas con bcrypt

- ✅ **Implementado** en `src/config/passport.js`
- Salt rounds configurados a 10 para seguridad óptima
- Hasheo automático durante el registro
- Comparación segura durante el login

```javascript
// Ejemplo de implementación:
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verificación:
const isValidPassword = await bcrypt.compare(password, user.password);
```

### 2. Passport.js para registro y login

- ✅ **Configuración completa** en `src/config/passport.js`
- ✅ **Estrategia local para login** (`local-login`)
- ✅ **Estrategia local para registro** (`local-register`)
- ✅ **Serialización/deserialización** de usuarios para sesiones

**Estrategias implementadas:**

- `passport-local`: Para autenticación con email/password
- Validación de datos en tiempo real
- Manejo de errores personalizado
- Integración con MongoDB Atlas

### 3. Autenticación de terceros con GitHub

- ✅ **OAuth 2.0 con GitHub** implementado
- ✅ **Configuración completa** en `src/config/passport.js`
- ✅ **Rutas de callback** en `src/routes/auth.js`
- ✅ **Botón de GitHub** en vista de login

**Características OAuth:**

- Integración con `passport-github2`
- Manejo automático de usuarios nuevos y existentes
- Vinculación de cuentas GitHub con cuentas locales
- Asignación automática de roles admin según configuración

## 🛠 Archivos Modificados

### `src/config/passport.js`

- Configuración completa de Passport.js
- Estrategias local-login y local-register
- Estrategia GitHub OAuth
- Serialización de usuarios para sesiones

### `src/routes/auth.js`

- Integración con Passport middleware
- Rutas OAuth para GitHub (`/auth/github`, `/auth/github/callback`)
- Manejo de errores mejorado
- Autenticación mediante `passport.authenticate()`

### `src/app.js`

- Inicialización de Passport después de sesiones
- Middleware global para datos de usuario
- Configuración de sesiones con MongoDB

### `src/views/login.hbs`

- Botón de "Continuar con GitHub"
- Información del sistema de autenticación
- Interfaz mejorada para múltiples métodos de login

## 🔐 Seguridad Implementada

1. **Contraseñas**: Nunca se almacenan en texto plano
2. **bcrypt**: Hash con salt para protección contra rainbow tables
3. **Sesiones**: Almacenadas de forma segura en MongoDB Atlas
4. **OAuth**: Flujo estándar GitHub con tokens seguros
5. **Validación**: Datos validados en frontend y backend

## 📊 Flujo de Autenticación

### Login Local:

1. Usuario envía email/password
2. Passport ejecuta estrategia `local-login`
3. bcrypt compara contraseña hasheada
4. Si es válida, crea sesión y redirige

### Registro Local:

1. Usuario envía datos de registro
2. Passport ejecuta estrategia `local-register`
3. bcrypt genera hash de la contraseña
4. Se crea usuario y sesión automáticamente

### GitHub OAuth:

1. Usuario hace clic en "Continuar con GitHub"
2. Redirección a GitHub para autorización
3. GitHub redirige a callback con código
4. Passport intercambia código por datos de usuario
5. Se crea/vincula cuenta y se inicia sesión

## 🎯 Características del Código

### Natural y Comprensible

- Comentarios descriptivos pero no excesivos
- Nombres de variables claras (`isValidPassword`, `hashedPassword`)
- Estructura lógica y fácil de seguir
- Manejo de errores consistente

### Profesional

- Uso de async/await en lugar de callbacks
- Validaciones robustas
- Separación de responsabilidades
- Configuración mediante variables de entorno

## 🧪 Pruebas Disponibles

### Credenciales de Prueba:

- **Admin**: `adminCoder@coder.com` / `admin123`
- **Registro**: Cualquier email válido + datos requeridos
- **GitHub**: Cualquier cuenta de GitHub

### URLs de Prueba:

- **Aplicación**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Registro**: http://localhost:3000/register
- **GitHub OAuth**: http://localhost:3000/auth/github

## 📝 Validación de Requisitos

✅ **Hashear la contraseña utilizando bcrypt** - COMPLETADO
✅ **Implementar Passport tanto para el registro como para el login** - COMPLETADO  
✅ **Añadir autenticación de terceros con GitHub en la vista de login** - COMPLETADO

## 🚀 Funcionamiento Actual

El sistema está completamente funcional y operativo:

- Base de datos conectada a MongoDB Atlas
- Todas las rutas funcionando correctamente
- Interfaz responsive y fácil de usar
- Autenticación múltiple (local + GitHub)
- Roles de usuario implementados
- Sesiones persistentes

**Servidor ejecutándose en**: http://localhost:3000
