const userObjectSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    email: { type: "string" },
    name: { type: ["string", "null"] },
    isAdmin: { type: "boolean" },
    createdAt: { type: "string", format: "date-time" },
  },
};

const errorsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },
};

const errorsResponseSchema = {
  type: "object",
  properties: {
    data: { type: "null" },
    errors: errorsSchema,
  },
};

const userCreateBodySchema = {
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
    name: {
      type: "string",
    },
    isAdmin: {
      type: "boolean",
    },
  },
};

export const allUsersResponseSchema = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        limit: { type: "number", default: 10 },
        skip: { type: "number", default: 0 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          data: { type: "array", items: userObjectSchema },
          meta: {
            type: "object",
            properties: {
              limit: { type: "number" },
              skip: { type: "number" },
              next: { type: ["string", "null"] },
              previous: { type: ["string", "null"] },
            },
          },
          errors: { type: "null" },
        },
      },
      500: {
        type: "object",
        properties: {
          data: { type: "null" },
          meta: { type: "null" },
          errors: errorsSchema,
        },
      },
    },
  },
};

export const userResponseSchema = {
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          data: userObjectSchema,
          errors: {
            type: "null",
          },
        },
      },
      404: errorsResponseSchema,
      500: errorsResponseSchema,
    },
  },
};

export const userCreateSchema = {
  schema: {
    body: userCreateBodySchema,
    response: {
      201: {
        type: "object",
        properties: {
          data: userObjectSchema,
          errors: { type: "null" },
        },
      },
      400: errorsResponseSchema,
      500: errorsResponseSchema,
    },
  },
};

export const userDeleteSchema = {
  schema: {
    response: {
      204: { description: "No Content", type: "null" },
      404: errorsResponseSchema,
      500: errorsResponseSchema,
    },
  },
};
