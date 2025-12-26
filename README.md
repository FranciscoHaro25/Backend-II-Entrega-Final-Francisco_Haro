# Backend II - Entrega Final

Comisión 85605 - Francisco Haro

## Instalación

```bash
npm install
npm start
```

Configurar el archivo `.env` con las variables necesarias (ver `.env.example`).

## Funcionalidades

- Autenticación con JWT y Passport
- Sistema de roles (admin, user, premium)
- CRUD de productos (solo admin puede crear, editar y eliminar)
- Carrito de compras (solo usuarios pueden agregar productos)
- Generación de tickets de compra
- Arquitectura por capas (DAO, Repository, Services, DTOs)

### Emails

El sistema envía correos en los siguientes casos:

- **Recuperación de contraseña**: cuando el usuario olvida su contraseña, recibe un mail con un link para restablecerla. El link expira en 1 hora y no permite usar la misma contraseña anterior.
- **Confirmación de compra**: al finalizar una compra se envía el ticket con el detalle de los productos y el total.
- **Alerta de stock bajo**: cuando un producto queda con pocas unidades después de una compra, se notifica al administrador.

## Tecnologías

- Node.js / Express
- MongoDB / Mongoose
- JWT / Passport
- Nodemailer
- Handlebars
