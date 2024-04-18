import CryptoJS from "crypto-js";

export class EncryptionService {
  private readonly key: string;
  constructor(key: string) {
    this.key = key;
  }
  public encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }
  public decrypt(data: string): string {
    return CryptoJS.AES.decrypt(data, this.key).toString(CryptoJS.enc.Utf8);
  }
}
