import { z } from "zod";
// import { buildJsonSchemas } from "fastify-zod";

const userBaseSchema = z.object({
  name: z.string(),
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a valid email",
  }),
});

const userResponseSchema = userBaseSchema.extend({
  id: z.string(),
  createdAt: z.string(),
});

const userCreateSchema = userBaseSchema.extend({
  password: z.string({
    required_error: "Password is required",
    // min: 8,
    // max_length: 64,
  }),
});

export type UserType = z.infer<typeof userBaseSchema>;
export type UserResponseType = z.infer<typeof userResponseSchema>;
export type UserCreateType = z.infer<typeof userCreateSchema>;

// export const { schema: userSchema, $ref } =
//   buildJsonSchemas({
//     userBaseSchema,
//     userResponseSchema,
//     userCreateSchema,
//   });
