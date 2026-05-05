import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { getToken } from '../../../storage/storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.25:8001";

export function useExportPdf() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = async (desde: string, hasta: string) => {
    try {
      setIsExporting(true);
      const token = await getToken();
      
      const endpoint = `${BASE_URL}/api/reportes/pdf`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fechaInicio: desde,
          fechaFin: hasta
        })
      });

      if (!response.ok) {
        throw new Error("Error del servidor al generar PDF");
      }

      const blob = await response.blob();

      if (Platform.OS === 'web') {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `Reporte_${desde}_al_${hasta}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);

      } else {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          
          const fileUri = FileSystem.documentDirectory + `Reporte_CRM.pdf`;

          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Reporte de Seguimientos'
            });
          } else {
            Alert.alert("Error", "Tu dispositivo no soporta compartir archivos.");
          }
        };
      }
    } catch (error) {
      console.error("Error exportando PDF:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor para generar el reporte.");
    } finally {
      setIsExporting(false);
    }
  };

  return { exportToPdf, isExporting };
}