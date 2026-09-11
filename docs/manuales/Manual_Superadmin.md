# <img src="./screenshots/logo.png" width="48" height="48" style="vertical-align: middle; margin-right: 12px;" /> Manual de Dirección General: Rol Superadmin - MJ-Company

**Sistema de Control, Inventario & Punto de Venta (POS)**  
*Versión: 2.0 (MJ-Company)*

---

## 1. Introducción y Acceso Directivo

El rol de **Superadmin** constituye el nivel de máxima jerarquía en la dirección y supervisión operativa de **MJ-Company**. Cuenta con facultades directivas integrales para la auditoría general de transacciones, resguardo y respaldo de datos comerciales, control de catálogo y gobierno de accesos.

### Autenticación Directiva Exclusiva con Google
Por estrictas políticas de seguridad implementadas en **MJ-Company**, el acceso directivo no admite contraseñas locales ni PINs. La verificación se realiza **ÚNICAMENTE** mediante **Google Sign-In** para las cuentas de dirección autorizadas.

![Login Superadmin Google](./screenshots/02_login_superadmin.png)

### Cuentas Directivas Autorizadas:
1. `esaalberdi@gmail.com`
2. `lemaitremariejoe@gmail.com`

> [!NOTE]
> Cualquier intento de autenticación con una cuenta no autorizada en la lista directiva es revocado y bloqueado de inmediato por las políticas de seguridad del sistema.

---

## 2. Panel de Dirección y Control General

![Panel de Superadministración](./screenshots/06_panel_superadmin.png)

### Facultades Funcionales y Módulos:

### A. Auditoría Integral de Operaciones y Seguridad
* Registro inmutable y cronológico de todos los eventos del sistema:
  * Inicios de sesión y aperturas de turnos por cada cajero.
  * Modificaciones directas de inventario, costos y precios de venta.
  * Anulaciones de ventas y autorizaciones de mermas/bajas.
  * Altas de usuarios, asignación de PINs y cambios de roles.

### B. Respaldo y Descarga de Datos del Sistema
* Exportación y descarga directa de los registros operativos (`productos`, `ventas`, `turnos`, `depósitos`, `usuarios`) en formatos estándar Excel (`.xlsx`) y CSV para resguardo histórico y análisis contable.

### C. Mantenimiento y Sincronización del Catálogo
* Capacidad de ejecutar acciones de sincronización centralizada de catálogo, reajustes masivos de existencias y control maestro de mercadería.

### D. Políticas de Acceso y Gobierno Directivo
* Supervisión general de los permisos concedidos a vendedores, supervisores y administradores, asegurando que las operaciones críticas del negocio mantengan estricto control y trazabilidad.

---

## 3. Resumen de Credenciales de Prueba Iniciales

Para fines de demostración y capacitación del personal, se encuentran configurados los siguientes accesos en el sistema:

| Rol | Método de Acceso | Identificador / Correo | Contraseña / PIN | Nombre Asignado |
| :--- | :--- | :--- | :--- | :--- |
| **Vendedor** | PIN numérico (6 dígitos) | `111111` | *(Solo PIN)* | Vendedor Mostrador |
| **Supervisor** | Correo Corporativo | `supervisor@mjcompany.io` | `Supervisor*123` | Supervisor Turno |
| **Admin** | Correo Corporativo | `admin@mjcompany.io` | `Admin*123` | Administrador Local |
| **Superadmin** | **Botón de Google** | `esaalberdi@gmail.com` | *(Autenticación Google)* | Superadmin E.S.A. |
| **Superadmin** | **Botón de Google** | `lemaitremariejoe@gmail.com` | *(Autenticación Google)* | Superadmin Marie-Joe |

---

## 4. Asistente RAG con IA Generativa
El sistema cuenta con un **Asistente Inteligente MJ** accesible permanentemente en la esquina inferior derecha. Dispone de un motor RAG con IA generativa (asistencia en línea con respaldo local de respuesta instantánea) con **aislamiento jerárquico estricto**: cada rol solo puede consultar información de su propio nivel o inferiores, protegiendo las funciones de mayor jerarquía.
