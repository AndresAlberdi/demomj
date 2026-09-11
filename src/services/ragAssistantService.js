/**
 * MJ-Company - Asistente RAG con IA Generativa (Gemini + Local Fallback)
 * Basado estrictamente en los manuales de roles con aislamiento jerárquico.
 */

export const VENDEDOR_MANUAL = `
=== MANUAL ROL: VENDEDOR (CAJERO / MOSTRADOR) ===
1. ACCESO:
- Se realiza con PIN numérico de 6 dígitos único (ej. 111111).
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
1. ACCESO:
- Se realiza mediante PIN de 6 dígitos (ej. 222222).
- Acceso directo al Panel de Supervisor.

2. PANEL DE SUPERVISIÓN:
- Supervisión del Turno Activo: Monitoreo en tiempo real de turnos abiertos, vendedor en turno, hora de inicio y recaudación acumulada.
- Auditorías de Inventario Físico (Conteos Ciegos): Selección de productos, conteo físico real en estantes y comparación automática con el stock de Firestore para detectar Faltantes o Sobrantes. Queda registrado con firma y fecha.
- Mermas / Bajas Autorizadas: Registro de productos dañados, vencidos o deteriorados, con motivo detallado (vencimiento, rotura, daño de empaque). Se descuenta de stock y se imputa al costo contable.
- Depósitos Bancarios de Efectivo: Registro de retiros de caja para depositar en cuentas bancarias de MJ-Company. Se registra monto, banco y comprobante, rebajando el efectivo en caja física.
`;

export const ADMIN_MANUAL = `
=== MANUAL ROL: ADMINISTRADOR (GESTIÓN COMERCIAL Y FINANCIERA) ===
1. ACCESO:
- Se realiza mediante PIN de 6 dígitos (ej. 333333) o credenciales administrativas autorizadas.

2. PANEL ADMINISTRATIVO:
- Catálogo de Productos y Precios: Creación de nuevos productos, edición de precio de venta, precio de costo y stock mínimo para alertas. Importación y exportación masiva vía Excel / CSV.
- Gestión de Usuarios y Permisos: Alta de personal asignando Nombre, Rol (vendedor, supervisor, admin) y PIN de 6 dígitos. Modificación de PIN o baja de usuarios.
- Módulo de Multas y Sanciones: Aplicación de penalizaciones o descuentos a vendedores por faltantes de caja no justificados o faltas. Historial de sanciones.
- Conciliación Financiera y Flujo de Caja: Balance consolidado de recaudación en efectivo, ingresos por transferencias QR, control de cartera de préstamos por cobrar y cálculo de margen de utilidad (ingresos menos costos de mercadería vendida y mermas).
`;

export const SUPERADMIN_MANUAL = `
=== MANUAL ROL: SUPERADMIN (GOBERNANZA TÉCNICA Y SEGURIDAD CLOUD) ===
1. ACCESO EXCLUSIVO CON GOOGLE (ZERO PASSWORD):
- No admite PIN ni contraseñas.
- Verificación estricta mediante Google Sign-In exclusivamente para los correos autorizados:
  * esaalberdi@gmail.com
  * lemaitremariejoe@gmail.com
- Bloqueo inmediato para cualquier otro correo o método.

2. PANEL DE SUPERADMINISTRACIÓN:
- Auditoría Global del Sistema: Trazabilidad completa de inicios de sesión, cambios de precio, mermas, anulaciones y cambios de roles.
- Respaldo Completo de Base de Datos: Exportación JSON/CSV de colecciones (products, sales, shifts, deposits, users, audit_logs).
- Gobernanza de Firestore: Reglas de seguridad estrictas en firestore.rules para blindar la base de datos a nivel de kernel de Google Cloud.
- Restablecimiento y Sincronización de Catálogos e Inventario.
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
        forbiddenSummary: 'Funciones de Supervisor (auditorías, conteos ciegos, mermas, depósitos bancarios), Administrador (crear usuarios, cambiar PINs, precios de costo, márgenes, multas) y Superadmin (reglas de Firestore, auditoría global).'
      };

    case 'supervisor':
      return {
        roleTitle: 'Supervisor de Turno',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}`,
        maxLevel: 2,
        forbiddenSummary: 'Funciones de Administrador (altas de usuarios, asignación de PINs, precios de costo, multas a personal) y Superadmin (reglas de Firestore, gobernanza de seguridad, lista blanca Google).'
      };

    case 'admin':
      return {
        roleTitle: 'Administrador General',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}\n\n${ADMIN_MANUAL}`,
        maxLevel: 3,
        forbiddenSummary: 'Funciones exclusivas de Superadmin (Gobernanza de reglas Firestore a nivel de kernel, administración de lista blanca de cuentas Google autorizadas y respaldos root del cluster).'
      };

    case 'superadmin':
      return {
        roleTitle: 'Superadministrador',
        allowedManuals: `${VENDEDOR_MANUAL}\n\n${SUPERVISOR_MANUAL}\n\n${ADMIN_MANUAL}\n\n${SUPERADMIN_MANUAL}`,
        maxLevel: 4,
        forbiddenSummary: 'Sin restricciones. Acceso integral a toda la documentación del sistema.'
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
    const superadminTerms = ['superadmin', 'google login', 'lista blanca', 'firestore rules', 'reglas de firestore', 'respaldo base de datos', 'backup'];

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
    const superadminTerms = ['superadmin', 'lista blanca', 'firestore rules', 'reglas de firestore', 'respaldo cluster'];

    const matchedTerm = [...adminTerms, ...superadminTerms].find(t => query.includes(t));
    if (matchedTerm) {
      return {
        allowed: false,
        message: `🔒 **Acceso Restringido por Nivel de Rol (Supervisor)**:\nComo asistente de **Supervisor**, puedo orientarte en supervisión de turno, auditorías físicas, mermas y depósitos bancarios. Las consultas sobre administración de usuarios, costos, multas o gobernanza de Firestore (**${matchedTerm}**) corresponden exclusivamente a los roles de **Administrador** y **Superadmin**.`
      };
    }
  }

  // Nivel 3: Admin intentando consultar gobernanza de Superadmin
  if (role === 'admin') {
    const superadminTerms = ['superadmin', 'lista blanca google', 'reglas de firestore', 'firestore rules', 'root backup'];
    const matchedTerm = superadminTerms.find(t => query.includes(t));
    if (matchedTerm) {
      return {
        allowed: false,
        message: `🔒 **Acceso Restringido por Nivel de Rol (Administrador)**:\nLas consultas relativas a la gobernanza a nivel de kernel de Google Cloud Firestore y la lista blanca de cuentas Superadmin (**${matchedTerm}**) son exclusivas del rol de **Superadmin** (esaalberdi@gmail.com / lemaitremariejoe@gmail.com).`
      };
    }
  }

  return { allowed: true };
}

/**
 * Motor RAG Local Zero-Database de Respaldo Instantáneo
 * Proporciona respuestas inmediatas y precisas basadas en los manuales según el rol.
 */
export function queryLocalRoleRAG(rawQuery, userRole) {
  const query = (rawQuery || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const role = (userRole || 'vendedor').toLowerCase();

  // 1. Preguntas de Superadmin
  if (role === 'superadmin') {
    if (query.includes('google') || query.includes('whitelist') || query.includes('lista blanca') || query.includes('cuenta')) {
      return "👑 **Cuentas Superadmin Autorizadas**:\n- El acceso está restringido estrictamente a Google Sign-In para:\n  * `esaalberdi@gmail.com`\n  * `lemaitremariejoe@gmail.com`\n- Cualquier intento desde otra cuenta o mediante contraseñas/PINs locales está bloqueado tanto por el frontend como por Firestore Rules.";
    }

    if (query.includes('backup') || query.includes('respaldo') || query.includes('exportar')) {
      return "💾 **Respaldo Global de Firestore**:\n- Desde el panel de Superadministración puedes exportar y descargar las colecciones `products`, `sales`, `shifts`, `deposits` y `users` en formato JSON/CSV para almacenamiento seguro o contingencias.";
    }
  }

  // 2. Preguntas de Admin
  if (role === 'admin' || role === 'superadmin') {
    if (query.includes('crear usuario') || query.includes('nuevo usuario') || query.includes('alta') || query.includes('pin')) {
      return "👤 **Gestión y Alta de Usuarios**:\n1. En el Panel de Administración, ingresa a la sección de **Usuarios**.\n2. Presiona **Nuevo Usuario**.\n3. Ingresa Nombre Completo, Rol (`vendedor`, `supervisor` o `admin`) y asigna el PIN numérico de 6 dígitos.\n4. Guarda los cambios. El colaborador podrá autenticarse de inmediato en la pantalla de inicio.";
    }

    if (query.includes('multa') || query.includes('sancion') || query.includes('penalizacion')) {
      return "⚖️ **Módulo de Multas y Sanciones**:\n- Permite registrar penalizaciones monetarias a vendedores por faltantes injustificados de caja o faltas operativas.\n- Cada registro especifica el vendedor sancionado, el monto y la justificación, manteniéndose en un historial auditable independiente del flujo ordinario de ventas.";
    }

    if (query.includes('costo') || query.includes('margen')) {
      return "🏷️ **Catálogo, Precios y Costos**:\n- Puedes crear y modificar productos indicando: Nombre, Categoría, Precio de Venta (Bs), Precio de Costo (Bs) y Stock Mínimo.\n- Mantener los costos actualizados garantiza que los reportes de margen de contribución y utilidad sean 100% fidedignos.";
    }
  }

  // 3. Preguntas de Supervisor
  if (role === 'supervisor' || role === 'admin' || role === 'superadmin') {
    if (query.includes('auditoria') || query.includes('conteo') || query.includes('ciego')) {
      return "📋 **Auditorías de Inventario Físico (Conteos Ciegos)**:\n1. En el panel del supervisor, dirígete a la sección de Auditorías.\n2. Selecciona los productos a auditar físicamente.\n3. Ingresa la cantidad real contada en mostradores y almacén.\n4. El sistema compara contra Firestore y determina faltantes o sobrantes.\n5. Registra la auditoría con tu firma y marca de tiempo inmutable.";
    }

    if (query.includes('merma') || query.includes('baja') || query.includes('danado') || query.includes('vencido')) {
      return "🗑️ **Registro y Autorización de Mermas**:\n1. Selecciona el producto afectado del catálogo.\n2. Indica el número de unidades a dar de baja.\n3. Especifica el motivo exacto (Vencimiento, Daño en empaque, Rotura en transporte).\n4. Confirma la baja. El sistema rebajará el stock físico y registrará la pérdida contable al costo de adquisición.";
    }

    if (query.includes('deposito') || query.includes('bancario') || query.includes('banco')) {
      return "🏦 **Depósitos Bancarios de Efectivo**:\n1. Cuando la caja acumule un monto relevante de efectivo, realiza el retiro físico.\n2. En la pestaña de Depósitos, indica el monto retirado y depositado.\n3. Selecciona el banco de destino y anota el número de comprobante o fotografía.\n4. Confirma el depósito para que el saldo pase de caja física a cuenta bancaria verificada.";
    }
  }

  // 4. Preguntas comunes de Vendedor / Operativas
  if (query.includes('mixto') || (query.includes('efectivo') && query.includes('qr'))) {
    return "💵📱 **Cobro Mixto (Efectivo + QR)**:\n1. En el checkout, selecciona **Pago Mixto**.\n2. Ingresa la cantidad pagada en efectivo y la cantidad recibida mediante transferencia QR (por ej. si son 50 Bs: 20 Bs efectivo y 30 Bs QR).\n3. El sistema valida que la suma cuadre exactamente con el total de la compra.\n4. Presiona Confirmar. Ambos montos quedarán desglosados en el arqueo del turno.";
  }

  if (query.includes('qr') || query.includes('transferencia')) {
    return "📱 **Cobro por QR (Transferencia Bancaria)**:\n1. Añade los productos al carrito.\n2. Selecciona la modalidad de cobro **QR**.\n3. El cliente escanea el código QR de la cuenta de MJ-Company con su app bancaria.\n4. Verifica el comprobante emitido por el banco.\n5. Presiona **Confirmar Venta QR** para registrar la venta y descontar el stock.";
  }

  if (query.includes('efectivo') || query.includes('cambio')) {
    return "💵 **Cobro en Efectivo**:\n1. Con los ítems en el carrito, selecciona **Efectivo**.\n2. Digita el monto entregado por el cliente en el campo 'Monto Recibido'.\n3. La pantalla calculará automáticamente el **Cambio** a devolver.\n4. Entrega el cambio y presiona **Confirmar Venta**.";
  }

  if (query.includes('prestamo') || query.includes('fianza') || query.includes('credito') || query.includes('deudor')) {
    return "📝 **Ventas en Préstamo / Fianza Interna**:\n- Si la venta corresponde a un consumo autorizado a crédito o fianza interna:\n1. Selecciona la modalidad **Préstamo**.\n2. Ingresa el nombre completo del deudor o funcionario.\n3. Confirma la operación. La deuda quedará registrada en la cartera de préstamos pendientes para su posterior conciliación.";
  }

  if (query.includes('turno') || query.includes('abrir') || query.includes('cerrar') || query.includes('caja')) {
    return "⏱️ **Apertura y Cierre de Turno**:\n- **Apertura**: Al iniciar la jornada, ingresa con tu PIN y verifica el fondo de caja inicial asignado.\n- **Operación**: Todas las ventas en efectivo y QR suman al balance de tu turno en tiempo real.\n- **Cierre**: Al terminar tu jornada laboral, realiza el arqueo de efectivo y confirma el cierre de turno antes de desloguearte.";
  }

  if (query.includes('buscar') || query.includes('producto') || query.includes('filtro') || query.includes('catalogo')) {
    return "🔍 **Búsqueda de Productos en POS**:\n- Utiliza la **barra de búsqueda rápida** superior escribiendo parte del nombre del producto.\n- O utiliza los **botones de categoría** (Bebidas, Snacks, Golosinas, etc.) para filtrar rápidamente el catálogo.";
  }

  // 4. Preguntas de Superadmin
  if (role === 'superadmin') {
    if (query.includes('google') || query.includes('whitelist') || query.includes('lista blanca') || query.includes('cuenta')) {
      return "👑 **Cuentas Superadmin Autorizadas**:\n- El acceso está restringido estrictamente a Google Sign-In para:\n  * `esaalberdi@gmail.com`\n  * `lemaitremariejoe@gmail.com`\n- Cualquier intento desde otra cuenta o mediante contraseñas/PINs locales está bloqueado tanto por el frontend como por Firestore Rules.";
    }

    if (query.includes('backup') || query.includes('respaldo') || query.includes('exportar')) {
      return "💾 **Respaldo Global de Firestore**:\n- Desde el panel de Superadministración puedes exportar y descargar las colecciones `products`, `sales`, `shifts`, `deposits` y `users` en formato JSON/CSV para almacenamiento seguro o contingencias.";
    }
  }

  // Fallback general adaptado al rol
  return `Soy el Asistente Oficial de **MJ-Company** para el rol **${role.toUpperCase()}**. Puedes consultarme dudas sobre los procedimientos oficiales de tu manual de operaciones.`;
}

/**
 * Consulta principal al Asistente RAG con IA Generativa (Gemini 3.5/3.6 Flash)
 * Integra guardrails jerárquicos y motor local de alta disponibilidad.
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

  const { roleTitle, allowedManuals, forbiddenSummary } = getRoleKnowledgeContext(userRole);

  const systemInstructionText = `
Eres el Asistente Virtual Oficial de MJ-Company para el rol: ${roleTitle}.
Tu propósito es guiar al colaborador en los procedimientos operativos de su rol, con un tono amable, claro, preciso y profesional.

REGLA SUPREMA DE JERARQUÍA Y CONFIDENCIALIDAD:
- Solo tienes acceso y autorización para responder en base al manual de operaciones adjunto abajo para este rol.
- Tienes ESTRICTAMENTE PROHIBIDO divulgar, detallar, confirmar o explicar funciones de roles de mayor jerarquía:
  (${forbiddenSummary}).
- Si el usuario pregunta por funciones que corresponden a un rol superior, debes negarte amablemente indicando que por políticas de seguridad de MJ-Company no tienes autorización para discutir funciones de roles superiores y sugerirle contactar a su supervisor o administrador.
- NUNCA inventes credenciales, tokens, ni detalles técnicos que no figuren en los manuales autorizados.

=== BASE DE CONOCIMIENTO AUTORIZADA PARA ESTE ROL ===
${allowedManuals}
`;

  // 2. Intentar llamada con Gemini API (Google Generative AI)
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (apiKey) {
    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash'];

    const formattedHistory = (history || []).slice(-6).map(item => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }]
    }));

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    for (const model of modelsToTry) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstructionText }] },
            contents,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText && candidateText.trim()) {
            return candidateText.trim();
          }
        }
      } catch (err) {
        console.warn(`Error llamando a Gemini (${model}):`, err.message);
      }
    }
  }

  // 3. Fallback de alta disponibilidad con RAG Local instantáneo
  return queryLocalRoleRAG(userMessage, userRole);
}
