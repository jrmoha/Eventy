import CryptoJS from "crypto-js";

export class EncryptionService {
  private readonly key: string;
  constructor(key: string) {
    this.key = key;
  }
  public encodeURI(data: string): string {
    return encodeURIComponent(this.encrypt(data));
  }
  public decodeURI(data: string): string {
    return decodeURIComponent(this.decrypt(data));
  }
  public encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.key).toString();
  }
  public decrypt(data: string): string {
    return CryptoJS.AES.decrypt(data, this.key).toString(CryptoJS.enc.Utf8);
  }
}
