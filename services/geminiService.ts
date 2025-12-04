import { GoogleGenAI } from "@google/genai";
import { UnitType } from "../types";

// Safe access to process.env for browser environments
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
    return '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();

// Initialize specific model for text tasks
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey: apiKey });
}

export const generateUnitDescription = async (
  name: string,
  type: UnitType,
  features: string[],
  address: string
): Promise<string> => {
  if (!ai) {
    console.warn("API Key missing, returning placeholder.");
    return "Deskripsi tidak dapat dibuat otomatis karena API Key belum dikonfigurasi. Silakan isi manual.";
  }

  try {
    const prompt = `
      Bertindaklah sebagai admin rental kamera dan gadget profesional.
      Buatlah deskripsi produk sewa yang menarik dan detail teknis singkat (maksimal 1 paragraf, sekitar 40-60 kata) untuk gadget berikut:
      
      Nama Unit: ${name}
      Kategori: ${type}
      Lokasi Pick-up: ${address}
      Kelengkapan/Spesifikasi: ${features.join(', ')}

      Fokus pada kondisi, keunggulan untuk fotografi/videografi (jika kamera) atau performa (jika iPhone), dan ajakan untuk menyewa. Gunakan Bahasa Indonesia.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Gagal membuat deskripsi.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.";
  }
};

export const analyzeMarketTips = async (occupancyRate: number, typeCounts: Record<string, number>): Promise<string> => {
    if (!ai) return "Fitur analisis memerlukan API Key.";

    try {
        const prompt = `
            Saya memiliki usaha rental kamera dan iPhone. 
            Persentase unit yang sedang disewa saat ini adalah ${occupancyRate}%.
            Distribusi stok unit saya: ${JSON.stringify(typeCounts)}.
            
            Berikan 3 saran singkat (bullet points) strategis untuk meningkatkan penyewaan atau rotasi unit gadget saya di pasar Indonesia.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Tidak ada saran tersedia.";
    } catch (error) {
        return "Gagal memuat analisis.";
    }
}