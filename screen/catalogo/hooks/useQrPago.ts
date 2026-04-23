/**
 * @file useQrPago.ts
 * @description Hook que encapsula el ciclo de vida de un pago por QR.
 *
 * FIX: onPagoConfirmado ahora es tipado como () => Promise<void> y se
 *      awaita correctamente en verificarPago, garantizando que el registro
 *      del prospecto se complete antes de cualquier otra acción.
 *      Se corrige además el stale closure sobre estadoQr usando una ref.
 */
import { useCallback, useRef, useState } from "react";

const API_BASE = process.env.EXPO_PUBLIC_QR_API_BASE;

export type EstadoQr =
  | "idle"
  | "generando"
  | "esperando"
  | "verificando"
  | "confirmado"
  | "error";

export interface QrGeneradoData {
  qrId: string;
  transactionId: string;
  qrImage: string;
}

interface UseQrPagoReturn {
  estadoQr: EstadoQr;
  qrData: QrGeneradoData | null;
  errorMsg: string | null;
  isVerifying: boolean;
  generarQr: (monto: number, descripcion?: string) => Promise<void>;
  verificarPago: () => Promise<void>;
  resetQr: () => void;
}

export function useQrPago(
  onPagoConfirmado: () => Promise<void>,
): UseQrPagoReturn {
  const [estadoQr, setEstadoQr] = useState<EstadoQr>("idle");
  const [qrData, setQrData] = useState<QrGeneradoData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const montadoRef = useRef(true);
  const qrIdRef = useRef<string | null>(null);
  const estadoQrRef = useRef<EstadoQr>("idle");

  const setEstadoSeguro = useCallback((estado: EstadoQr) => {
    if (montadoRef.current) {
      estadoQrRef.current = estado;
      setEstadoQr(estado);
    }
  }, []);

  const generarQr = useCallback(
    async (monto: number, descripcion = "Pago QR Metasoft") => {
      setEstadoSeguro("generando");
      setErrorMsg(null);
      setIsVerifying(false);
      qrIdRef.current = null;

      try {
        const res = await fetch(`${API_BASE}/generar-qr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monto: String(monto),
            moneda: "BOB",
            descripcion,
            branchCode: "",
          }),
        });

        const json = await res.json();

        if (!json?.ok) {
          throw new Error("La API no pudo generar el QR.");
        }

        if (!montadoRef.current) return;

        const data: QrGeneradoData = {
          qrId: json.qrId,
          transactionId: json.transactionId,
          qrImage: json.qrImage,
        };

        setQrData(data);
        qrIdRef.current = data.qrId;
        setEstadoSeguro("esperando");
      } catch (err: any) {
        if (montadoRef.current) {
          setErrorMsg(err?.message || "No se pudo generar el QR.");
          setEstadoSeguro("error");
        }
      }
    },
    [setEstadoSeguro],
  );

  const verificarPago = useCallback(async () => {
    const qrId = qrIdRef.current;
    const estadoActual = estadoQrRef.current;

    if (!qrId || estadoActual === "confirmado" || estadoActual === "error") {
      return;
    }

    setIsVerifying(true);
    setEstadoSeguro("verificando");

    try {
      const res = await fetch(`${API_BASE}/verificar-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId }),
      });

      const json = await res.json();

      if (!montadoRef.current) return;

      const pagoRealizado =
        json?.estado !== 0 || json?.body?.statusQrCode !== 0;

      if (pagoRealizado) {
        setEstadoSeguro("confirmado");
        await onPagoConfirmado();
      } else {
        setEstadoSeguro("esperando");
      }
    } catch {
      if (montadoRef.current) setEstadoSeguro("esperando");
    } finally {
      if (montadoRef.current) setIsVerifying(false);
    }
  }, [onPagoConfirmado, setEstadoSeguro]);

  const resetQr = useCallback(() => {
    setQrData(null);
    setErrorMsg(null);
    setIsVerifying(false);
    setEstadoSeguro("idle");
    qrIdRef.current = null;
  }, [setEstadoSeguro]);

  return {
    estadoQr,
    qrData,
    errorMsg,
    isVerifying,
    generarQr,
    verificarPago,
    resetQr,
  };
}
