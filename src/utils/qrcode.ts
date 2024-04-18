import QRCode from "qrcode";

export class QrCodeService {
  constructor() {}
  public generate(data: string): Promise<string> {
    return QRCode.toDataURL(data, { errorCorrectionLevel: "H" });
  }
}
