# Módulo de Cotización — `cotizacion/`

Formulario de cotización de seguro vehicular con los 4 campos requeridos para iniciar una póliza.

## Archivos

```
cotizacion/
├── components/
│   ├── CotizacionForm.tsx         # Componente principal (React / Next.js)
│   └── CotizacionForm.module.css  # Estilos con CSS Modules
├── hooks/
│   └── useCotizacionForm.ts       # Lógica, validación y estado del formulario
├── types/
│   └── cotizacion.ts              # Tipos TypeScript
├── index.ts                       # Barrel export
└── example-page.tsx               # Ejemplo de integración en Next.js
```

## Campos del formulario

| Campo | Tipo | Validación |
|---|---|---|
| `fechaNacimiento` | `date` (ISO string) | 18–85 años |
| `genero` | `"M" \| "F"` | Requerido |
| `codigoPostal` | `string` | 5 dígitos numéricos |
| `descripcionFactura` | `string` | 20–500 caracteres |

## Uso rápido

```tsx
import { CotizacionForm } from '@/cotizacion';
import type { CotizacionPayload } from '@/cotizacion';

async function handleSubmit(payload: CotizacionPayload) {
  await fetch('/api/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

<CotizacionForm onSubmit={handleSubmit} />
```

## Props de `<CotizacionForm>`

| Prop | Tipo | Descripción |
|---|---|---|
| `onSubmit` | `(payload: CotizacionPayload) => Promise<void> \| void` | Callback con datos validados |
| `loading` | `boolean` (opcional) | Estado de carga externo (ej. fetch en curso) |

## Payload enviado a `onSubmit`

```ts
{
  fechaNacimiento: "1990-04-15",   // ISO date string
  genero: "M",                      // "M" | "F"
  codigoPostal: "21000",
  descripcionFactura: "Vehículo adquirido mediante crédito...",
  edad: 35                          // calculado automáticamente
}
```

## Integración con `policies-service`

El payload mapea directamente al endpoint sugerido en el README:

```
POST /api/policies
Content-Type: application/json

{
  "fechaNacimiento": "1990-04-15",
  "genero": "M",
  "codigoPostal": "21000",
  "descripcionFactura": "...",
  "edad": 35
}
```

## Dónde colocar los archivos en el proyecto

```
clients/web/
├── app/
│   └── cotizar/
│       └── page.tsx               ← example-page.tsx
└── src/
    └── cotizacion/                ← esta carpeta completa
        ├── components/
        ├── hooks/
        ├── types/
        └── index.ts
```
