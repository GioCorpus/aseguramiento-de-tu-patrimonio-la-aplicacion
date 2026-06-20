'use client';

/**
 * Ejemplo de uso: clients/web/app/cotizar/page.tsx
 *
 * Muestra cómo integrar <CotizacionForm> con el endpoint
 * POST /api/policies del policies-service.
 */

import { useRouter } from 'next/navigation';
import { CotizacionForm } from '@/cotizacion';
import type { CotizacionPayload } from '@/cotizacion';

export default function CotizarPage() {
  const router = useRouter();

  async function handleCotizacion(payload: CotizacionPayload) {
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message ?? 'Error al crear la cotización.');
    }

    const { policyId } = await res.json();
    router.push(`/cotizar/${policyId}`);
  }

  return (
    <main style={{ minHeight: '100dvh', padding: '0 1rem' }}>
      <CotizacionForm onSubmit={handleCotizacion} />
    </main>
  );
}
