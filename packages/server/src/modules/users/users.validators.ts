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
