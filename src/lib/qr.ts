import QRCode from "qrcode";

export async function qrDataUrl(value: string): Promise<string> {
  return QRCode.toDataURL(value, {
    margin: 1,
    width: 280,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
}
