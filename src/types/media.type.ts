export const allowed_types = {
  image: new RegExp("png|jpg|jpeg|gif|svg"),
};

export type AllowedMedia = keyof typeof allowed_types;
