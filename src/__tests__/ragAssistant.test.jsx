import { describe, it, expect } from 'vitest';
import {
  validateRoleQueryBoundary,
  getRoleKnowledgeContext,
  queryLocalRoleRAG,
  VENDEDOR_MANUAL,
  SUPERVISOR_MANUAL,
  ADMIN_MANUAL,
  SUPERADMIN_MANUAL
} from '../services/ragAssistantService';

describe('Hierarchical RAG Assistant - Security & Role Boundaries', () => {
  describe('validateRoleQueryBoundary', () => {
    it('strictly forbids Vendedor from asking about Supervisor, Admin, and Superadmin functions', () => {
      // Trying to ask about supervisor features
      const q1 = validateRoleQueryBoundary('¿Cómo hago una auditoría de conteo ciego?', 'vendedor');
      expect(q1.allowed).toBe(false);
      expect(q1.message).toContain('Acceso Restringido');

      const q2 = validateRoleQueryBoundary('¿Cómo autorizo una merma o baja de producto?', 'vendedor');
      expect(q2.allowed).toBe(false);
      expect(q2.message).toContain('Acceso Restringido');

      // Trying to ask about admin features
      const q3 = validateRoleQueryBoundary('¿Cómo creo un nuevo usuario o cambio el PIN?', 'vendedor');
      expect(q3.allowed).toBe(false);
      expect(q3.message).toContain('Acceso Restringido');

      const q4 = validateRoleQueryBoundary('¿Dónde se configuran las multas o precios de costo?', 'vendedor');
      expect(q4.allowed).toBe(false);
      expect(q4.message).toContain('Acceso Restringido');

      // Trying to ask about superadmin features
      const q5 = validateRoleQueryBoundary('¿Cómo se editan las reglas de firestore del superadmin?', 'vendedor');
      expect(q5.allowed).toBe(false);
      expect(q5.message).toContain('Acceso Restringido');
    });

    it('allows Vendedor to ask legitimate questions about POS, QR, Cash and Shifts', () => {
      const q1 = validateRoleQueryBoundary('¿Cómo hago un cobro con QR bancario?', 'vendedor');
      expect(q1.allowed).toBe(true);

      const q2 = validateRoleQueryBoundary('¿Cómo registro un cobro mixto entre efectivo y transferencia?', 'vendedor');
      expect(q2.allowed).toBe(true);

      const q3 = validateRoleQueryBoundary('¿Cómo registro un préstamo a un cliente habitual?', 'vendedor');
      expect(q3.allowed).toBe(true);

      const q4 = validateRoleQueryBoundary('¿Cómo se realiza el cierre de caja de mi turno?', 'vendedor');
      expect(q4.allowed).toBe(true);
    });

    it('allows Supervisor to ask about Audits and Mermas, but blocks Admin creation and pricing', () => {
      // Legitimate supervisor actions
      const q1 = validateRoleQueryBoundary('¿Cómo se registra una merma por producto vencido?', 'supervisor');
      expect(q1.allowed).toBe(true);

      const q2 = validateRoleQueryBoundary('¿Cómo hago un conteo ciego de inventario?', 'supervisor');
      expect(q2.allowed).toBe(true);

      // Blocked admin actions
      const q3 = validateRoleQueryBoundary('¿Cómo crear un usuario en el sistema?', 'supervisor');
      expect(q3.allowed).toBe(false);
      expect(q3.message).toContain('Acceso Restringido por Nivel de Rol (Supervisor)');

      const q4 = validateRoleQueryBoundary('¿Cómo configuro el margen de utilidad y precio de costo?', 'supervisor');
      expect(q4.allowed).toBe(false);
    });

    it('allows Admin to manage users and pricing, but blocks Superadmin cloud governance', () => {
      // Legitimate admin actions
      const q1 = validateRoleQueryBoundary('¿Cómo dar de alta a un nuevo vendedor con su PIN?', 'admin');
      expect(q1.allowed).toBe(true);

      const q2 = validateRoleQueryBoundary('¿Cómo aplico una multa a un vendedor?', 'admin');
      expect(q2.allowed).toBe(true);

      // Blocked superadmin actions
      const q3 = validateRoleQueryBoundary('¿Cómo modifico las reglas de firestore a nivel de kernel?', 'admin');
      expect(q3.allowed).toBe(false);
      expect(q3.message).toContain('Acceso Restringido por Nivel de Rol (Administrador)');
    });

    it('allows Superadmin unrestricted access across all system modules', () => {
      const q1 = validateRoleQueryBoundary('¿Cómo funciona el POS?', 'superadmin');
      expect(q1.allowed).toBe(true);

      const q2 = validateRoleQueryBoundary('¿Cómo se hace un conteo ciego?', 'superadmin');
      expect(q2.allowed).toBe(true);

      const q3 = validateRoleQueryBoundary('¿Cómo se administran los PINs?', 'superadmin');
      expect(q3.allowed).toBe(true);

      const q4 = validateRoleQueryBoundary('¿Cuáles son las cuentas google autorizadas?', 'superadmin');
      expect(q4.allowed).toBe(true);
    });
  });

  describe('getRoleKnowledgeContext', () => {
    it('provides strictly vendor manual to Vendedor role', () => {
      const ctx = getRoleKnowledgeContext('vendedor');
      expect(ctx.allowedManuals).toContain('ROL: VENDEDOR');
      expect(ctx.allowedManuals).not.toContain('ROL: SUPERVISOR');
      expect(ctx.allowedManuals).not.toContain('ROL: ADMINISTRADOR');
      expect(ctx.allowedManuals).not.toContain('ROL: SUPERADMIN');
    });

    it('provides vendor and supervisor manuals to Supervisor role', () => {
      const ctx = getRoleKnowledgeContext('supervisor');
      expect(ctx.allowedManuals).toContain('ROL: VENDEDOR');
      expect(ctx.allowedManuals).toContain('ROL: SUPERVISOR');
      expect(ctx.allowedManuals).not.toContain('ROL: ADMINISTRADOR');
      expect(ctx.allowedManuals).not.toContain('ROL: SUPERADMIN');
    });

    it('provides vendor, supervisor, and admin manuals to Admin role', () => {
      const ctx = getRoleKnowledgeContext('admin');
      expect(ctx.allowedManuals).toContain('ROL: VENDEDOR');
      expect(ctx.allowedManuals).toContain('ROL: SUPERVISOR');
      expect(ctx.allowedManuals).toContain('ROL: ADMINISTRADOR');
      expect(ctx.allowedManuals).not.toContain('ROL: SUPERADMIN');
    });

    it('provides all manuals to Superadmin role', () => {
      const ctx = getRoleKnowledgeContext('superadmin');
      expect(ctx.allowedManuals).toContain('ROL: VENDEDOR');
      expect(ctx.allowedManuals).toContain('ROL: SUPERVISOR');
      expect(ctx.allowedManuals).toContain('ROL: ADMINISTRADOR');
      expect(ctx.allowedManuals).toContain('ROL: SUPERADMIN');
    });
  });

  describe('queryLocalRoleRAG Fallback Engine', () => {
    it('returns exact vendor instructions for QR, mixed payment, loans, and shifts', () => {
      const qrRes = queryLocalRoleRAG('¿Cómo cobro con QR?', 'vendedor');
      expect(qrRes).toContain('Cobro por QR');
      expect(qrRes).toContain('Confirmar Venta QR');

      const mixtoRes = queryLocalRoleRAG('¿Cómo funciona el pago mixto efectivo y QR?', 'vendedor');
      expect(mixtoRes).toContain('Cobro Mixto (Efectivo + QR)');

      const prestamoRes = queryLocalRoleRAG('¿Cómo registro una fianza o préstamo?', 'vendedor');
      expect(prestamoRes).toContain('Préstamo / Fianza Interna');

      const turnoRes = queryLocalRoleRAG('¿Cómo abro o cierro el turno de caja?', 'vendedor');
      expect(turnoRes).toContain('Apertura y Cierre de Turno');
    });

    it('returns supervisor guidance for inventory audits, mermas, and deposits', () => {
      const auditRes = queryLocalRoleRAG('¿Cómo hacer un conteo ciego de auditoría?', 'supervisor');
      expect(auditRes).toContain('Auditorías de Inventario Físico (Conteos Ciegos)');

      const mermaRes = queryLocalRoleRAG('¿Cómo doy de baja un producto dañado o vencido por merma?', 'supervisor');
      expect(mermaRes).toContain('Registro y Autorización de Mermas');

      const depRes = queryLocalRoleRAG('¿Cómo registro un depósito bancario?', 'supervisor');
      expect(depRes).toContain('Depósitos Bancarios de Efectivo');
    });

    it('returns admin guidance for creating users and fines', () => {
      const userRes = queryLocalRoleRAG('¿Cómo dar de alta un nuevo usuario?', 'admin');
      expect(userRes).toContain('Gestión y Alta de Usuarios');

      const fineRes = queryLocalRoleRAG('¿Cómo registrar una multa a un vendedor?', 'admin');
      expect(fineRes).toContain('Módulo de Multas y Sanciones');
    });

    it('returns superadmin guidance for google whitelist and backups', () => {
      const saRes = queryLocalRoleRAG('¿Cuáles son las cuentas google de la whitelist?', 'superadmin');
      expect(saRes).toContain('esaalberdi@gmail.com');
      expect(saRes).toContain('lemaitremariejoe@gmail.com');

      const backupRes = queryLocalRoleRAG('¿Cómo hacer un backup de la base de datos?', 'superadmin');
      expect(backupRes).toContain('Respaldo Global de Firestore');
    });
  });
});
