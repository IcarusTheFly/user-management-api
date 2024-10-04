import { MultipartFile } from "@fastify/multipart";

const userIdValidationError = (id: string) => {
  if (isNaN(Number(id))) {
    return `Validation error: ID (${id}) is not a valid number`;
  }
  return null;
};

export const validateCreateUser = (email: string, password: string) => {
  const errors = [];
  if (!email) {
    errors.push({
      message: "Validation error: body must have required property 'email'",
    });
  }
  if (!password) {
    errors.push({
      message: "Validation error: body must have required property 'password'",
    });
  } else if (password.length < 8) {
    errors.push({
      message:
        "Validation error: body/password must NOT have fewer than 8 characters",
    });
  } else if (password.length > 64) {
    errors.push({
      message:
        "Validation error: body/password must NOT have more than 64 characters",
    });
  }

  return errors;
};

export const validateUpdateUser = (
  id: string,
  email?: string,
  password?: string,
  name?: string,
  isAdmin?: boolean
) => {
  const errors = [];
  const userIdErrorMessage = userIdValidationError(id);
  if (userIdErrorMessage) {
    errors.push({
      message: userIdErrorMessage,
    });
  }
  if (!email && !password && !name && !isAdmin) {
    errors.push({
      message: "Validation error: body must have at least one property",
    });
  }
  if (password) {
    if (password.length < 8) {
      errors.push({
        message:
          "Validation error: body/password must NOT have fewer than 8 characters",
      });
    } else if (password.length > 64) {
      errors.push({
        message:
          "Validation error: body/password must NOT have more than 64 characters",
      });
    }
  }

  return errors;
};

export const validateDeleteUser = (id: string) => {
  const errors = [];
  const userIdErrorMessage = userIdValidationError(id);
  if (userIdErrorMessage) {
    errors.push({
      message: userIdErrorMessage,
    });
  }

  return errors;
};

export const validateGetUser = (id: string) => {
  const errors = [];
  const userIdErrorMessage = userIdValidationError(id);
  if (userIdErrorMessage) {
    errors.push({
      message: userIdErrorMessage,
    });
  }

  return errors;
};

export const validateUserAvatarFile = (part: MultipartFile) => {
  const errors = [];
  if (!part.filename) {
    errors.push({
      message: "Validation error: file must have a filename",
    });
  }
  if (!part.mimetype) {
    errors.push({
      message: "Validation error: file must have a mimetype",
    });
  }
  const validMimeTypes = ["image/jpeg", "image/png"];
  if (!validMimeTypes.includes(part.mimetype)) {
    errors.push({
      message:
        "Validation error: Invalid file type. Only JPEG and PNG are allowed",
    });
  }

  return errors;
};
