export type Email = {
  to: string;
  subject?: string;
  html?: string;
  attachDataUrls?: boolean;
  template?: string;
  context?: Record<string, unknown>;
};

export type EmailServer = {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
};
