# <img src="./screenshots/logo.png" width="48" height="48" style="vertical-align: middle; margin-right: 12px;" /> Manual de Gestión: Rol Administrador - MJ-Company

**Sistema de Control, Inventario & Punto de Venta (POS)**  
*Versión: 2.0 (MJ-Company)*

---

## 1. Introducción y Acceso

El rol de **Administrador** concentra las facultades de gestión comercial, configuración de catálogo, control financiero, administración de personal y altas de usuarios en **MJ-Company**.

### Acceso al Sistema:
* En la pantalla de login, selecciona la pestaña **Admin** e ingresa el PIN de 6 dígitos asignado (por defecto de prueba: `333333`).

---

## 2. Panel de Administración General

![Panel de Administración](./screenshots/05_panel_admin.png)

### Funcionalidades y Módulos:

### A. Catálogo de Productos y Precios
1. **Crear Producto**: Permite dar de alta nuevos productos indicando Nombre, Categoría, Precio de Venta (Bs), Precio de Costo (Bs) y Stock Inicial.
2. **Edición Rápida**: Modificación de precios, costos y umbrales de stock mínimo para alertas.
3. **Importación / Exportación Masiva**: Soporte para carga de catálogos mediante archivos CSV o Excel (XLSX).

### B. Gestión de Usuarios y Permisos (Altas de Personal)
* **Crear Nuevo Usuario**:
  1. En la sección de Usuarios, presiona **Nuevo Usuario**.
  2. Asigna el Nombre Completo.
  3. Define el Rol: `vendedor`, `supervisor` o `admin`.
  4. Asigna el **PIN de 6 dígitos**.
  5. El usuario queda activo inmediatamente para operar en la pantalla de inicio.
* **Baja o Modificación**: Puedes editar el PIN o deshabilitar usuarios en cualquier momento.

### C. Módulo de Multas y Sanciones a Vendedores
* Diseñado para registrar penalizaciones o descuentos a vendedores por faltantes de caja no justificados o incumplimientos de turno.
* Historial de pagos de multas independiente del flujo regular de ventas.

### D. Conciliación Financiera y Flujo de Caja
* **Ingresos por Efectivo**: Recaudación real en caja física.
* **Ingresos por QR**: Verificación contra extractos bancarios.
* **Préstamos Pendientes**: Cartera de deudas por cobrar.
* **Cálculo de Utilidad**: Ingresos totales menos costos de mercadería vendida y mermas autorizadas.

---

## 3. Resguardos de Seguridad y Políticas
* Mantén actualizados los precios de costo para que los reportes de margen de contribución sean exactos.
* Revisa periódicamente las alertas de productos bajo el stock mínimo para emitir órdenes de compra a proveedores.
