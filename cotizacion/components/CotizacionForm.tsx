'use client';

import React, { useCallback } from 'react';
import styles from './CotizacionForm.module.css';
import { useCotizacionForm, formatearFecha, limitesFecha } from '../hooks/useCotizacionForm';
import type { CotizacionPayload, Genero } from '../types/cotizacion';

// ─── Props ───────────────────────────────────────────────────────────────────

interface CotizacionFormProps {
  /** Callback que recibe los datos validados al enviar */
  onSubmit: (payload: CotizacionPayload) => Promise<void> | void;
  /** Estado de carga externo (ej. llamada a API en curso) */
  loading?: boolean;
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

interface FieldGroupProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

function FieldGroup({ id, label, error, hint, required, children, badge }: FieldGroupProps) {
  return (
    <div className={`${styles.fieldGroup} ${error ? styles.fieldError : ''}`}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
        {required && <span className={styles.requiredDot} aria-label="requerido" />}
        {badge}
      </label>
      {children}
      {hint && !error && (
        <p className={styles.fieldHint} id={`${id}-hint`}>{hint}</p>
      )}
      {error && (
        <p className={styles.errorMsg} id={`${id}-err`} role="alert">{error}</p>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CotizacionForm({ onSubmit, loading = false }: CotizacionFormProps) {
  const { min: minDate, max: maxDate } = limitesFecha();

  const handleSubmit = useCallback(
    async (payload: CotizacionPayload) => {
      await onSubmit(payload);
    },
    [onSubmit]
  );

  const {
    values,
    errors,
    touched,
    isSubmitting,
    isFormValid,
    progreso,
    edad,
    setField,
    touchField,
    handleSubmit: submitForm,
  } = useCotizacionForm({ onSubmit: handleSubmit });

  const isLoading = isSubmitting || loading;

  // Resumen preview
  const resumen = [
    { label: 'Fecha de nacimiento', value: values.fechaNacimiento ? formatearFecha(values.fechaNacimiento) : '—' },
    { label: 'Edad', value: edad ? `${edad} años` : '—' },
    { label: 'Género', value: values.genero === 'M' ? 'Masculino' : values.genero === 'F' ? 'Femenino' : '—' },
    { label: 'Código postal', value: values.codigoPostal || '—' },
    {
      label: 'Descripción de factura',
      value: values.descripcionFactura.trim()
        ? values.descripcionFactura.trim().slice(0, 60) + (values.descripcionFactura.length > 60 ? '…' : '')
        : '—',
    },
  ];

  return (
    <div className={styles.wrapper} aria-label="Formulario de cotización de seguro vehicular">
      {/* Header */}
      <div className={styles.header}>
        <p className={styles.eyebrow}>Cotización de seguro vehicular</p>
        <h1 className={styles.title}>Datos del conductor habitual</h1>
        <p className={styles.subtitle}>Necesitamos esta información para calcular tu prima.</p>
        <div className={styles.progressBar} role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100} aria-label={`${progreso}% completado`}>
          <div className={styles.progressFill} style={{ width: `${progreso}%` }} />
        </div>
      </div>

      {/* Sección conductor */}
      <section className={styles.card} aria-labelledby="seccion-conductor">
        <p className={styles.stepEyebrow} id="seccion-conductor">Paso 1 de 2 · Conductor</p>

        <FieldGroup
          id="dob"
          label="Fecha de nacimiento"
          required
          error={touched.fechaNacimiento ? errors.fechaNacimiento : undefined}
          hint="Conductor con mayor uso del vehículo. Debes ser mayor de 18 años."
          badge={
            edad ? (
              <span className={styles.ageBadge} aria-label={`Edad: ${edad} años`}>
                {edad} años
              </span>
            ) : null
          }
        >
          <input
            type="date"
            id="dob"
            name="fechaNacimiento"
            min={minDate}
            max={maxDate}
            value={values.fechaNacimiento}
            onChange={e => setField('fechaNacimiento', e.target.value)}
            onBlur={() => touchField('fechaNacimiento')}
            aria-required="true"
            aria-describedby={`dob-hint${touched.fechaNacimiento && errors.fechaNacimiento ? ' dob-err' : ''}`}
            className={styles.input}
          />
        </FieldGroup>

        <FieldGroup
          id="gender"
          label="Género"
          required
          error={touched.genero ? errors.genero : undefined}
        >
          <div className={styles.genderGrid} role="radiogroup" aria-label="Género del conductor habitual">
            {(['M', 'F'] as Genero[]).map(g => (
              <label
                key={g}
                className={`${styles.genderOption} ${values.genero === g ? styles.genderSelected : ''}`}
              >
                <input
                  type="radio"
                  name="genero"
                  value={g}
                  checked={values.genero === g}
                  onChange={() => { setField('genero', g); touchField('genero'); }}
                  aria-label={g === 'M' ? 'Masculino' : 'Femenino'}
                />
                <span className={styles.genderLabel}>{g === 'M' ? 'Masculino' : 'Femenino'}</span>
              </label>
            ))}
          </div>
        </FieldGroup>
      </section>

      {/* Sección vehículo */}
      <section className={styles.card} aria-labelledby="seccion-vehiculo">
        <p className={styles.stepEyebrow} id="seccion-vehiculo">Paso 2 de 2 · Vehículo</p>

        <div className={styles.cpRow}>
          <FieldGroup
            id="cp"
            label="Código postal"
            required
            error={touched.codigoPostal ? errors.codigoPostal : undefined}
            hint="Donde se usa principalmente el vehículo."
          >
            <input
              type="text"
              id="cp"
              name="codigoPostal"
              placeholder="21000"
              maxLength={5}
              inputMode="numeric"
              value={values.codigoPostal}
              onChange={e => setField('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))}
              onBlur={() => touchField('codigoPostal')}
              aria-required="true"
              className={styles.input}
            />
          </FieldGroup>
          <div className={styles.cpBadge}>Frontera norte · MX</div>
        </div>

        <FieldGroup
          id="invoice"
          label="Descripción de acuerdo de factura"
          required
          error={touched.descripcionFactura ? errors.descripcionFactura : undefined}
          hint="Incluye valor de factura, forma de adquisición y financiamiento si aplica."
        >
          <textarea
            id="invoice"
            name="descripcionFactura"
            maxLength={500}
            rows={4}
            placeholder="Ej. Vehículo adquirido mediante crédito automotriz, valor factura $350,000 MXN, financiado por BBVA, plazo 48 meses, primera adquisición."
            value={values.descripcionFactura}
            onChange={e => setField('descripcionFactura', e.target.value)}
            onBlur={() => touchField('descripcionFactura')}
            aria-required="true"
            className={styles.textarea}
          />
          <p className={styles.charCount} aria-live="polite">
            {values.descripcionFactura.length} / 500
          </p>
        </FieldGroup>
      </section>

      {/* Resumen + CTA */}
      <div className={styles.footer}>
        <div className={styles.summaryCard} aria-label="Resumen de datos ingresados">
          <p className={styles.summaryTitle}>Resumen</p>
          <dl className={styles.summaryList}>
            {resumen.map(({ label, value }) => (
              <div key={label} className={styles.summaryRow}>
                <dt className={styles.summaryKey}>{label}</dt>
                <dd className={styles.summaryVal}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          className={styles.ctaBtn}
          disabled={!isFormValid || isLoading}
          onClick={submitForm}
          aria-label="Obtener cotización de seguro vehicular"
        >
          {isLoading ? 'Procesando…' : 'Obtener cotización'}
        </button>

        <p className={styles.legal}>
          Datos protegidos con TLS 1.3 · Plataforma Fronteriza de Seguros Vehicular
        </p>
      </div>
    </div>
  );
}

export default CotizacionForm;
