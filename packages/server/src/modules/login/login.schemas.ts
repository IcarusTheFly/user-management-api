export const loginSchema = {
  schema: {
    tags: ["Login"],
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: {
          type: "string",
          format: "email",
        },
        password: {
          type: "string",
          minLength: 8,
          maxLength: 64,
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
        },
      },
      400: {
        type: "object",
        properties: {
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
      401: {
        type: "object",
        properties: {
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};
