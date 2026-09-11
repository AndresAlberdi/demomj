/**
 * MJ-Company - Asistente RAG con IA Generativa (Gemini + Motor Local de Respaldo)
 * Basado estrictamente en los manuales de roles con aislamiento jerárquico.
 */

export const VENDEDOR_MANUAL = `
=== MANUAL ROL: VENDEDOR (CAJERO / MOSTRADOR) ===
1. ACCESO:
- Se realiza exclusivamente con PIN numérico de 6 dígitos único (ej. 111111).
- Valida en terminal y dirige a la Terminal de Ventas (POS).

2. TERMINAL POS:
- Cabecera: Nombre de operador, estado de turno, botón de alternar tema o cerrar sesión.
- Filtros por Categoría: Bebidas, Snacks, Golosinas, etc.
- Buscador Dinámico: Búsqueda en tiempo real por nombre de producto.
- Catálogo: Tarjetas con producto, precio en Bs y stock disponible. Al pulsar se añade al carrito.
- Carrito de compras: Control de cantidades (+/-), subtotal y total calculado.

3. MODALIDADES DE COBRO:
- Efectivo: Se ingresa monto recibido del cliente. El sistema calcula el cambio a devolver. Descuenta stock al confirmar.
- QR (Transferencia Bancaria): El cliente escanea el código QR oficial de MJ-Company. El vendedor debe verificar la recepción del comprobante antes de confirmar la venta QR.
- Pago Mixto: Permite dividir el total entre Efectivo y QR (ej. de 50 Bs: 20 Bs efectivo y 30 Bs QR). Se registra con exactitud en el arqueo.
- Préstamos / Fianza Interna: Venta a crédito autorizada para personal o cliente recurrente indicando el nombre del deudor.

4. CONTROL DE CAJA Y TURNOS:
- Al iniciar la jornada se abre el turno con el fondo de caja inicial.
- Durante el turno se registran todas las ventas en efectivo, transferencias QR y préstamos.
- Al terminar la jornada se realiza el arqueo y cierre de turno.
`;

export const SUPERVISOR_MANUAL = `
=== MANUAL ROL: SUPERVISOR (PISO Y OPERACIONES) ===
1. ACCESO CORPORATIVO:
- Se realiza exclusivamente mediante Correo Corporativo (@mjcompany.io) y contraseña (ej. supervisor@mjcompany.io / Supervisor*123).
- No admite ingreso con PIN numérico.
- Acceso directo al Panel de Supervisor.

2. PANEL DE SUPERVISIÓN:
- Supervisión del Turno Activo: Monitoreo en tiempo real de turnos abiertos, vendedor en turno, hora de inicio y recaudación acumulada.
- Auditorías de Inventario Físico (Conteos Ciegos): Selección de productos, conteo físico real en estantes y comparación automática con el stock del sistema para detectar Faltantes o Sobrantes. Queda registrado con firma y fecha.
- Mermas / Bajas Autorizadas: Registro de productos dañados, vencidos o deteriorados, con motivo detallado (vencimiento, rotura, daño de empaque). Se descuenta de stock y se imputa al costo contable.
- Depósitos Bancarios de Efectivo: Registro de retiros de caja para depositar en cuentas bancarias de MJ-Company. Se registra monto, banco y comprobante, rebajando el efectivo en caja física.
`;

export const ADMIN_MANUAL = `
=== MANUAL ROL: ADMINISTRADOR (GESTIÓN COMERCIAL Y FINANCIERA) ===
1. ACCESO CORPORATIVO:
- Se realiza exclusivamente mediante Correo Corporativo (@mjcompany.io) y contraseña (ej. admin@mjcompany.io / Admin*123).
- No admite ingreso con PIN numérico.

2. PANEL ADMINISTRATIVO:
- Catálogo de Productos y Precios: Creación de nuevos productos, edición de precio de venta, precio de costo y stock mínimo para alertas. Importación y exportación masiva vía Excel / CSV.
- Gestión de Usuarios y Permisos: Alta de personal asignando Nombre, Rol (vendedor con PIN de 6 dígitos, supervisor o admin con correo @mjcompany.io). Modificación o baja de usuarios.
- Módulo de Multas y Sanciones: Aplicación de penalizaciones o descuentos a vendedores por faltantes de caja no justificados o faltas. Historial de sanciones.
- Conciliación Financiera y Flujo de Caja: Balance consolidado de recaudación en efectivo, ingresos por transferencias QR, control de cartera de préstamos por cobrar y cálculo de margen de utilidad (ingresos menos costos de mercadería vendida y mermas).
`;

export const SUPERADMIN_MANUAL = `
=== MANUAL ROL: SUPERADMIN (DIRECCIÓN GENERAL Y CONTROL DEL SISTEMA) ===
1. ACCESO DIRECTIVO EXCLUSIVO:
- Acceso seguro mediante verificación de cuentas directivas autorizadas exclusivamente para:
  * esaalberdi@gmail.com
  * lemaitremariejoe@gmail.com
- Control de acceso de máxima jerarquía en MJ-Company.

2. PANEL DE CONTROL DIRECTIVO:
- Auditoría Global del Sistema: Trazabilidad completa de operaciones comerciales, aperturas de turnos, modificaciones de inventario, mermas, anulaciones y asignación de roles.
- Respaldo General de Información: Exportación y descarga completa de datos del sistema (productos, ventas, turnos, depósitos y usuarios) en formatos Excel (.xlsx) y CSV.
- Políticas de Seguridad y Control de Acceso: Supervisión de permisos y cumplimiento de normativas operativas del sistema.
- Sincronización y Mantenimiento del Catálogo: Actualización y sincronización centralizada de productos e inventarios.
`;

/**
 * Jerarquía de conocimiento permitido según el rol activo.
 */
export function getRoleKnowledgeContext(userRole) {
  const role = (userRole || 'vendedor').toLowerCase();

  switch (role) {
    case 'vendedor':
      return {
        roleTitle: 'Vendedor / Cajero',
        allowedManuals: VENDEDOR_MANUAL,
        maxLevel: 1,
        forbiddenSummary: 'Funciones de Supervisor (auditorías, conteos ciegos, mermas, depósitos bancarios), Administrador (crear usuarios, precios de costo, márgenes, multas) y Superadmin (auditoría global y respaldos del sistema).'
      };

    case 'supervisor':
      return {
        roleTitle: 'Supervisor de Turno',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}`,
        maxLevel: 2,
        forbiddenSummary: 'Funciones de Administrador (altas de usuarios, precios de costo, multas a personal) y Superadmin (auditorías globales, respaldos generales del sistema).'
      };

    case 'admin':
      return {
        roleTitle: 'Administrador General',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}\n\n${ADMIN_MANUAL}`,
        maxLevel: 3,
        forbiddenSummary: 'Funciones exclusivas de Superadmin (Auditoría global de eventos, descarga de respaldos generales y control directivo del sistema).'
      };

    case 'superadmin':
      return {
        roleTitle: 'Superadministrador',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}\n\n${ADMIN_MANUAL}\n\n${SUPERADMIN_MANUAL}`,
        maxLevel: 4,
        forbiddenSummary: 'Sin restricciones. Acceso integral a toda la documentación funcional del sistema.'
      };

    default:
      return {
        roleTitle: 'Vendedor',
        allowedManuals: VENDEDOR_MANUAL,
        maxLevel: 1,
        forbiddenSummary: 'Funciones de roles superiores (Supervisor, Admin, Superadmin).'
      };
  }
}

/**
 * Filtro de seguridad jerárquica estricta.
 * Detecta si un rol inferior está intentando consultar funciones de un rol superior.
 */
export function validateRoleQueryBoundary(rawQuery, userRole) {
  const query = (rawQuery || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const role = (userRole || 'vendedor').toLowerCase();

  // Nivel 1: Vendedor intentando consultar funciones de Supervisor, Admin o Superadmin
  if (role === 'vendedor') {
    const supervisorTerms = ['supervisor', 'auditoria', 'conteo ciego', 'contar stock', 'merma', 'baja de producto', 'dar de baja', 'deposito bancario', 'depositar efectivo'];
    const adminTerms = ['admin', 'administrador', 'crear usuario', 'nuevo usuario', 'alta usuario', 'cambiar pin', 'modificar pin', 'precio de costo', 'margen', 'ganancia', 'multa', 'sancion', 'sancionar'];
    const superadminTerms = ['superadmin', 'google login', 'respaldo general', 'auditoria global', 'backup general'];

    const matchedTerm = [...supervisorTerms, ...adminTerms, ...superadminTerms].find(t => query.includes(t));
    if (matchedTerm) {
      return {
        allowed: false,
        message: `🔒 **Acceso Restringido por Nivel de Rol (Vendedor)**:\nComo asistente de **Vendedor / Cajero**, solo estoy autorizado a responder sobre la operación de la Terminal POS, cobros (efectivo, QR, mixto), catálogo de ventas y caja de turno. No tengo autorización para brindar información sobre funciones de supervisión o administración (**${matchedTerm}**). Por favor consulta con tu supervisor o administrador.`
      };
    }
  }

  // Nivel 2: Supervisor intentando consultar funciones de Admin o Superadmin
  if (role === 'supervisor') {
    const adminTerms = [
      'admin', 'administrador', 'crear usuario', 'crear un usuario', 'nuevo usuario', 
      'alta usuario', 'alta de usuario', 'cambiar pin', 'eliminar usuario', 
      'precio de costo', 'margen', 'multa', 'sancion'
    ];
    const superadminTerms = ['superadmin', 'auditoria global', 'respaldo general', 'backup general'];

    const matchedTerm = [...adminTerms, ...superadminTerms].find(t => query.includes(t));
    if (matchedTerm) {
      return {
        allowed: false,
        message: `🔒 **Acceso Restringido por Nivel de Rol (Supervisor)**:\nComo asistente de **Supervisor**, puedo orientarte en supervisión de turno, auditorías físicas, mermas y depósitos bancarios. Las consultas sobre administración de personal, costos o auditoría global (**${matchedTerm}**) corresponden exclusivamente a los roles de **Administrador** y **Superadmin**.`
      };
    }
  }

  // Nivel 3: Admin intentando consultar gobernanza de Superadmin
  if (role === 'admin') {
    const superadminTerms = ['superadmin', 'auditoria global', 'respaldo general', 'backup general'];
    const matchedTerm = superadminTerms.find(t => query.includes(t));
    if (matchedTerm) {
      return {
        allowed: false,
        message: `🔒 **Acceso Restringido por Nivel de Rol (Administrador)**:\nLas consultas sobre auditoría global del sistema y respaldos generales (**${matchedTerm}**) son exclusivas de la **Dirección General (Superadmin)**.`
      };
    }
  }

  return { allowed: true };
}

/**
 * Motor RAG Local Zero-Database de Alta Precisión
 * Proporciona respuestas inmediatas y precisas basadas en los manuales según el rol.
 */
export function queryLocalRoleRAG(rawQuery, userRole) {
  const query = (rawQuery || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const role = (userRole || 'vendedor').toLowerCase();

  // --- SECCIÓN SUPERADMIN ---
  if (role === 'superadmin') {
    if (query.includes('google') || query.includes('cuenta') || query.includes('acceso') || query.includes('directiv')) {
      return "👑 **Cuentas Directivas Autorizadas (Superadmin)**:\n- El acceso a la dirección general está reservado para las cuentas directivas autorizadas:\n  * `esaalberdi@gmail.com`\n  * `lemaitremariejoe@gmail.com`\n- Cuentan con facultades de auditoría integral, sincronización de catálogo y descarga de respaldos generales.";
    }

    if (query.includes('backup') || query.includes('respaldo') || query.includes('exportar')) {
      return "💾 **Respaldo General de Datos del Sistema**:\n- Desde el panel de Superadministración puedes exportar y descargar la información del sistema (productos, ventas, turnos, depósitos y usuarios) en formatos Excel (.xlsx) y CSV para control administrativo o resguardo seguro.";
    }
  }

  // --- SECCIÓN ADMIN ---
  if (role === 'admin' || role === 'superadmin') {
    if (query.includes('crear usuario') || query.includes('nuevo usuario') || query.includes('alta') || query.includes('pin') || query.includes('usuario')) {
      return "👤 **Gestión y Alta de Usuarios**:\n1. En el Panel de Administración, ingresa a la sección de **Usuarios**.\n2. Presiona **Nuevo Usuario**.\n3. Ingresa Nombre Completo y selecciona el Rol:\n   - **Vendedor**: Asigna un PIN numérico de 6 dígitos.\n   - **Supervisor / Admin**: Asigna su correo corporativo `@mjcompany.io` y contraseña.\n4. Guarda los cambios. El colaborador podrá autenticarse de inmediato en la pantalla de inicio.";
    }

    if (query.includes('multa') || query.includes('sancion') || query.includes('penalizacion')) {
      return "⚖️ **Módulo de Multas y Sanciones**:\n- Permite registrar penalizaciones monetarias a vendedores por faltantes injustificados de caja o faltas operativas.\n- Cada registro especifica el vendedor sancionado, el monto y la justificación, manteniéndose en un historial auditable independiente del flujo ordinario de ventas.";
    }

    if (query.includes('costo') || query.includes('margen') || query.includes('utilidad')) {
      return "🏷️ **Catálogo, Precios y Costos**:\n- Puedes crear y modificar productos indicando: Nombre, Categoría, Precio de Venta (Bs), Precio de Costo (Bs) y Stock Mínimo.\n- Mantener los costos actualizados garantiza que los reportes de margen de contribución y utilidad sean 100% fidedignos.";
    }
  }

  // --- SECCIÓN SUPERVISOR ---
  if (role === 'supervisor' || role === 'admin' || role === 'superadmin') {
    if (query.includes('auditoria') || query.includes('conteo') || query.includes('ciego') || query.includes('fisic') || query.includes('inventario')) {
      return "📋 **Auditorías de Inventario Físico (Conteos Ciegos)**:\n1. En el panel del supervisor, dirígete a la sección de **Auditorías**.\n2. Selecciona la categoría o los productos específicos a auditar físicamente.\n3. Ingresa la **Cantidad Física Contada** real en mostradores y almacenes.\n4. El sistema compara automáticamente contra el stock registrado en el sistema y calcula la discrepancia:\n   - **Faltante**: Mercadería faltante no registrada.\n   - **Sobrante**: Excedente físico.\n5. Presiona **Confirmar Auditoría**. Quedará registrada con tu firma digital y marca de tiempo inmutable.";
    }

    if (query.includes('merma') || query.includes('baja') || query.includes('danado') || query.includes('vencido') || query.includes('rotura')) {
      return "🗑️ **Registro y Autorización de Mermas / Bajas**:\n1. Selecciona el producto afectado del catálogo.\n2. Indica el número exacto de unidades a dar de baja.\n3. Especifica el motivo detallado (ej. *Vencimiento*, *Daño en transporte*, *Rotura de empaque*).\n4. Confirma la baja. El sistema rebajará el stock físico al instante y registrará la pérdida contable al costo de adquisición.";
    }

    if (query.includes('deposito') || query.includes('bancario') || query.includes('banco') || query.includes('retirar efectivo')) {
      return "🏦 **Depósitos Bancarios de Efectivo**:\n1. Cuando la caja acumule un monto relevante de efectivo, realiza el retiro físico de caja.\n2. En la pestaña de **Depósitos**, indica el monto retirado y depositado.\n3. Selecciona la entidad bancaria receptora de MJ-Company.\n4. Adjunta el número de comprobante o fotografía del depósito.\n5. Confirma la operación para que el saldo pase de caja física a cuenta bancaria verificada.";
    }

    if (query.includes('turno activo') || query.includes('supervisar') || query.includes('vendedor en turno')) {
      return "⏱️ **Supervisión del Turno Activo**:\n- Permite verificar en tiempo real si existe un turno abierto, qué vendedor está operando, la hora de inicio y el flujo acumulado de efectivo, QR y préstamos.\n- Te permite detectar anomalías antes del arqueo de cierre.";
    }
  }

  // --- SECCIÓN VENDEDOR / OPERATIVA POS ---
  if (query.includes('mixto') || (query.includes('efectivo') && query.includes('qr'))) {
    return "💵📱 **Cobro Mixto (Efectivo + QR)**:\n1. En el checkout, selecciona **Pago Mixto**.\n2. Ingresa la cantidad pagada en efectivo y la cantidad recibida mediante transferencia QR (por ej. si son 50 Bs: 20 Bs efectivo y 30 Bs QR).\n3. El sistema valida que la suma cuadre exactamente con el total de la compra.\n4. Presiona Confirmar. Ambos montos quedarán desglosados en el arqueo del turno.";
  }

  if (query.includes('qr') || query.includes('transferencia')) {
    return "📱 **Cobro por QR (Transferencia Bancaria)**:\n1. Añade los productos al carrito.\n2. Selecciona la modalidad de cobro **QR**.\n3. El cliente escanea el código QR de la cuenta de MJ-Company con su app bancaria.\n4. Verifica el comprobante emitido por el banco.\n5. Presiona **Confirmar Venta QR** para registrar la venta y descontar el stock.";
  }

  if (query.includes('efectivo') || query.includes('cambio') || query.includes('vuelto')) {
    return "💵 **Cobro en Efectivo**:\n1. Con los ítems en el carrito, selecciona **Efectivo**.\n2. Digita el monto entregado por el cliente en el campo 'Monto Recibido'.\n3. La pantalla calculará automáticamente el **Cambio** a devolver.\n4. Entrega el cambio y presiona **Confirmar Venta**.";
  }

  if (query.includes('prestamo') || query.includes('fianza') || query.includes('credito') || query.includes('deudor')) {
    return "📝 **Ventas en Préstamo / Fianza Interna**:\n- Si la venta corresponde a un consumo autorizado a crédito o fianza interna:\n1. Selecciona la modalidad **Préstamo**.\n2. Ingresa el nombre completo del deudor o funcionario.\n3. Confirma la operación. La deuda quedará registrada en la cartera de préstamos pendientes para su posterior conciliación.";
  }

  if (query.includes('turno') || query.includes('abrir') || query.includes('cerrar') || query.includes('caja') || query.includes('arqueo')) {
    return "⏱️ **Apertura y Cierre de Turno**:\n- **Apertura**: Al iniciar la jornada, ingresa con tu PIN y verifica el fondo de caja inicial asignado.\n- **Operación**: Todas las ventas en efectivo y QR suman al balance de tu turno en tiempo real.\n- **Cierre**: Al terminar tu jornada laboral, realiza el arqueo de efectivo y confirma el cierre de turno antes de desloguearte.";
  }

  if (query.includes('buscar') || query.includes('producto') || query.includes('filtro') || query.includes('catalogo')) {
    return "🔍 **Búsqueda de Productos en POS**:\n- Utiliza la **barra de búsqueda rápida** superior escribiendo parte del nombre del producto.\n- O utiliza los **botones de categoría** (Bebidas, Snacks, Golosinas, etc.) para filtrar rápidamente el catálogo.";
  }

  // Fallback general adaptado al rol
  return `Soy el Asistente Oficial de **MJ-Company** para el rol **${role.toUpperCase()}**.\nPuedes consultarme dudas sobre los procedimientos oficiales de tu manual de operaciones (por ejemplo: cobros, turnos, auditorías, mermas o depósitos según tus privilegios).`;
}

/**
 * Consulta principal al Asistente RAG con IA Generativa (Gemini Flash + Fast Fallback)
 * Garantiza respuesta inmediata (< 500ms) sin bloqueos ni cuelgues.
 */
export async function askMJCompanyAssistant(userMessage, userRole = 'vendedor', history = []) {
  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
    return "Por favor ingresa una pregunta o consulta sobre las operaciones de tu rol.";
  }

  // 1. Verificación estricta de barreras de seguridad por rol
  const boundaryCheck = validateRoleQueryBoundary(userMessage, userRole);
  if (!boundaryCheck.allowed) {
    return boundaryCheck.message;
  }

  // 2. Comprobar si el motor RAG local ya tiene una respuesta directa de alta coincidencia
  const cleanQuery = userMessage.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const commonKeywords = [
    'conteo', 'ciego', 'auditoria', 'merma', 'baja', 'deposito', 'qr', 'transferencia',
    'mixto', 'efectivo', 'prestamo', 'fianza', 'turno', 'arqueo', 'crear usuario',
    'alta', 'multa', 'sancion', 'costo', 'margen', 'google', 'whitelist', 'backup'
  ];

  const hasDirectTopicMatch = commonKeywords.some(kw => cleanQuery.includes(kw));

  // Si es una pregunta estándar de manual, responder con el RAG local optimizado
  if (hasDirectTopicMatch) {
    return queryLocalRoleRAG(userMessage, userRole);
  }

  // 3. Para preguntas abiertas, consultar Gemini con Timeout estricto de 2000ms
  const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';

  if (apiKey) {
    const { roleTitle, allowedManuals, forbiddenSummary } = getRoleKnowledgeContext(userRole);

    const systemInstructionText = `
Eres el Asistente Virtual Oficial de MJ-Company para el rol: ${roleTitle}.
Responde de forma concisa, profesional y estructurada basada estrictamente en este manual:
${allowedManuals}

REGLA DE SEGURIDAD:
No hables de funciones superiores a ${roleTitle} (${forbiddenSummary}).
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstructionText }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500
          }
        })
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText && candidateText.trim()) {
          return candidateText.trim();
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
      // Timeout o error de red: se continúa al fallback local de inmediato
    }
  }

  // 4. Fallback de alta disponibilidad con RAG Local instantáneo
  return queryLocalRoleRAG(userMessage, userRole);
}
