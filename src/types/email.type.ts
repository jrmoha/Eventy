export type Email = {
  to: string;
  subject?: string;
  html?: string;
};

export type EmailServer = {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
};
