export class APIError extends Error {
  public statusCode;
  constructor(message: string, statusCode: number, name = "Error") {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}
