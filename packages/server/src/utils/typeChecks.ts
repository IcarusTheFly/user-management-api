interface ErrorWithStatusType {
  message: string;
  statusCode: number;
  code?: string;
}

export const isErrorWithStatusType = (
  error: unknown
): error is ErrorWithStatusType => {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    "message" in error &&
    typeof error.message === "string"
  );
};
