export const paginationOptions = {
  defaultLimit: 10,
  defaultSkip: 0,
};

export const loggerOptions = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

export const fileUploadOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
};

export const uploadDir = "../../uploads";
