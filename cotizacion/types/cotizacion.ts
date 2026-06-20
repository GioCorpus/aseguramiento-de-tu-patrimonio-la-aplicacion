export type Genero = 'M' | 'F';

export interface DatosConductor {
  fechaNacimiento: string; // ISO date string: "YYYY-MM-DD"
  genero: Genero;
  codigoPostal: string;    // 5 dígitos
  descripcionFactura: string;
}

export interface CotizacionPayload extends DatosConductor {
  edad: number;            // calculado al momento del envío
}

export interface CotizacionFormErrors {
  fechaNacimiento?: string;
  genero?: string;
  codigoPostal?: string;
  descripcionFactura?: string;
}

export interface CotizacionFormState {
  values: DatosConductor;
  errors: CotizacionFormErrors;
  touched: Record<keyof DatosConductor, boolean>;
  isSubmitting: boolean;
}
