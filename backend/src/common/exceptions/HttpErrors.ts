import { ZodError } from "zod";


export const ErrorCode = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_TAKEN: 'EMAIL_ALREADY_TAKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',

  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  NAME_ALREADY_TAKEN: 'NAME_ALREADY_TAKEN',

  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',

  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type ErrorCodeType = keyof typeof ErrorCode;


export class HttpError extends Error {
  public constructor(
    public readonly statusCode: number,
    public readonly errorCode: string,
  ) {
    super(errorCode);
  }
};

export class ValidationError extends HttpError {
  public readonly errors: Record<string, string[]>;

  public constructor(zodError: ZodError) {
    super(400, ErrorCode.VALIDATION_ERROR);

    this.errors = {};

    zodError.issues.forEach((issue) => {
      const field = issue.path.join('.'); 

      if (!this.errors[field]) {
        this.errors[field] = [];
      }
      this.errors[field].push(issue.message);
    });
  }
};

export class UnauthorizedError extends HttpError {
  public constructor(errorCode: ErrorCodeType = 'UNAUTHORIZED') {
    super(401, errorCode);
  }
};

export class NotFoundError extends HttpError {
  public constructor(errorCode: ErrorCodeType = 'NOT_FOUND') {
    super(404, errorCode);
  }
};

export class ForbiddenError extends HttpError {
  public constructor() {
    super(403, ErrorCode.FORBIDDEN);
  }
};

export class ServerError extends HttpError {
  public constructor(errorCode = 'INTERNAL_SERVER_ERROR') {
    super(500, errorCode);
  }
};

export class InvalidCredentialsError extends HttpError {
  public constructor() {
    super(409, ErrorCode.INVALID_CREDENTIALS);
  }
};

export class ConflictError extends HttpError {
  public constructor(errorCode: ErrorCodeType) {
    super(409, errorCode);
  }
};