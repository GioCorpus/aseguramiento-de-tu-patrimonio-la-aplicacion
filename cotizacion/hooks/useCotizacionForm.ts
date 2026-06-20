import { useState, useCallback, useMemo } from 'react';
import type {
  DatosConductor,
  CotizacionFormErrors,
  CotizacionFormState,
  CotizacionPayload,
  Genero,
} from '../types/cotizacion';

const EDAD_MIN = 18;
const EDAD_MAX = 85;
const CP_REGEX = /^\d{5}$/;
const DESCRIPCION_MIN = 20;
const DESCRIPCION_MAX = 500;

// ─── Utilidades ─────────────────────────────────────────────────────────────

export function calcularEdad(fechaNacimiento: string): number {
  const nacimiento = new Date(fechaNacimiento + 'T12:00:00');
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const cumpleEsteAnio = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  if (hoy < cumpleEsteAnio) edad--;
  return edad;
}

export function formatearFecha(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function limitesFecha(): { min: string; max: string } {
  const hoy = new Date();
  const max = new Date(hoy.getFullYear() - EDAD_MIN, hoy.getMonth(), hoy.getDate());
  const min = new Date(hoy.getFullYear() - EDAD_MAX, hoy.getMonth(), hoy.getDate());
  return {
    max: max.toISOString().split('T')[0],
    min: min.toISOString().split('T')[0],
  };
}

// ─── Validación ──────────────────────────────────────────────────────────────

export function validarCampos(values: DatosConductor): CotizacionFormErrors {
  const errors: CotizacionFormErrors = {};

  if (!values.fechaNacimiento) {
    errors.fechaNacimiento = 'La fecha de nacimiento es requerida.';
  } else {
    const edad = calcularEdad(values.fechaNacimiento);
    if (edad < EDAD_MIN || edad > EDAD_MAX) {
      errors.fechaNacimiento = `El conductor debe tener entre ${EDAD_MIN} y ${EDAD_MAX} años.`;
    }
  }

  if (!values.genero) {
    errors.genero = 'Selecciona el género del conductor habitual.';
  }

  if (!CP_REGEX.test(values.codigoPostal)) {
    errors.codigoPostal = 'Ingresa los 5 dígitos del código postal.';
  }

  const desc = values.descripcionFactura.trim();
  if (desc.length < DESCRIPCION_MIN) {
    errors.descripcionFactura = `Describe el acuerdo de factura (mínimo ${DESCRIPCION_MIN} caracteres).`;
  } else if (desc.length > DESCRIPCION_MAX) {
    errors.descripcionFactura = `Máximo ${DESCRIPCION_MAX} caracteres.`;
  }

  return errors;
}

// ─── Hook principal ───────────────────────────────────────────────────────────

const initialValues: DatosConductor = {
  fechaNacimiento: '',
  genero: '' as Genero,
  codigoPostal: '',
  descripcionFactura: '',
};

const initialTouched = {
  fechaNacimiento: false,
  genero: false,
  codigoPostal: false,
  descripcionFactura: false,
};

interface UseCotizacionFormOptions {
  onSubmit: (payload: CotizacionPayload) => Promise<void> | void;
}

export function useCotizacionForm({ onSubmit }: UseCotizacionFormOptions) {
  const [state, setState] = useState<CotizacionFormState>({
    values: initialValues,
    errors: {},
    touched: initialTouched,
    isSubmitting: false,
  });

  const setField = useCallback(
    <K extends keyof DatosConductor>(field: K, value: DatosConductor[K]) => {
      setState(prev => {
        const values = { ...prev.values, [field]: value };
        const errors = prev.touched[field] ? validarCampos(values) : prev.errors;
        return { ...prev, values, errors };
      });
    },
    []
  );

  const touchField = useCallback((field: keyof DatosConductor) => {
    setState(prev => {
      const touched = { ...prev.touched, [field]: true };
      const errors = validarCampos(prev.values);
      return { ...prev, touched, errors };
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    const allTouched = Object.keys(initialTouched).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as typeof initialTouched
    );
    const errors = validarCampos(state.values);
    setState(prev => ({ ...prev, touched: allTouched, errors }));

    if (Object.keys(errors).length > 0) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      const payload: CotizacionPayload = {
        ...state.values,
        edad: calcularEdad(state.values.fechaNacimiento),
      };
      await onSubmit(payload);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [state.values, onSubmit]);

  const progreso = useMemo(() => {
    const { fechaNacimiento, genero, codigoPostal, descripcionFactura } = state.values;
    const filled = [
      !!fechaNacimiento,
      !!genero,
      CP_REGEX.test(codigoPostal),
      descripcionFactura.trim().length >= DESCRIPCION_MIN,
    ].filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  }, [state.values]);

  const isFormValid = useMemo(
    () => Object.keys(validarCampos(state.values)).length === 0,
    [state.values]
  );

  const edad = useMemo(
    () => (state.values.fechaNacimiento ? calcularEdad(state.values.fechaNacimiento) : null),
    [state.values.fechaNacimiento]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isFormValid,
    progreso,
    edad,
    setField,
    touchField,
    handleSubmit,
  };
}
