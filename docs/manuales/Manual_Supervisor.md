# <img src="./screenshots/logo.png" width="48" height="48" style="vertical-align: middle; margin-right: 12px;" /> Manual Operativo: Rol Supervisor - MJ-Company

**Sistema de Control, Inventario & Punto de Venta (POS)**  
*Versión: 2.0 (MJ-Company)*

---

## 1. Introducción y Acceso

El **Supervisor** es responsable del control operativo en piso: auditorías de inventario físico, control y autorización de mermas, registro de depósitos de efectivo a cuentas bancarias y verificación del cumplimiento de turnos en **MJ-Company**.

### Acceso Corporativo con Correo (@mjcompany.io):
1. En la pantalla de inicio, selecciona la pestaña **Supervisor**.
2. Ingresa tu correo corporativo oficial (por defecto de prueba: `supervisor@mjcompany.io`).
3. Ingresa tu contraseña de acceso (por defecto de prueba: `Supervisor*123`).
4. El sistema validará tu pertenencia al dominio corporativo y te otorgará acceso directo al **Panel del Supervisor**.

---

## 2. Panel del Supervisor

![Panel del Supervisor](./screenshots/04_panel_supervisor.png)

### Secciones Principales:

### A. Supervisión del Turno Activo
* Permite verificar en tiempo real si existe un turno abierto, qué vendedor está operando, la hora de inicio y el flujo acumulado de efectivo y transferencias.

### B. Auditorías de Inventario Físico (Conteos Ciegos)
1. El supervisor selecciona los productos a auditar.
2. Ingresa la cantidad física real contada en los mostradores y almacenes.
3. El sistema compara el conteo físico contra el stock en Firestore y calcula la discrepancia:
   * **Faltante**: Mercadería faltante no registrada.
   * **Sobrante**: Excedente físico.
4. Las auditorías quedan registradas con firma digital del supervisor y marca de tiempo.

### C. Registro y Autorización de Mermas / Bajas
* Si un producto caduca, se rompe o se deteriora:
  1. Selecciona el producto del catálogo.
  2. Indica la cantidad a dar de baja.
  3. Registra el motivo detallado (ej. *Vencimiento*, *Daño en transporte*, *Rotura de empaque*).
  4. Confirma la baja para ajustar el inventario y reflejar la pérdida contable al costo de adquisición.

### D. Depósitos Bancarios de Efectivo
* Cuando la caja acumula un monto significativo de efectivo, el supervisor realiza el retiro y depósito en la cuenta bancaria de **MJ-Company**.
* En la pestaña de depósitos:
  1. Registra el monto depositado.
  2. Selecciona la entidad bancaria receptora.
  3. Adjunta el número de comprobante o fotografía del depósito.
  4. El sistema descuenta el efectivo en caja física y lo transfiere a saldo bancario verificado.

---

## 3. Coordinación con Administración
* El supervisor reporta directamente al **Administrador** ante anomalías recurrentes en inventario o comportamientos irregulares en las ventas.
* Todas las acciones de auditoría quedan grabadas en la colección `inventory_audits` para trazabilidad completa.
