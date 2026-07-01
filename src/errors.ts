export class ScavioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScavioError";
  }
}

export class MissingAPIKeyError extends ScavioError {
  constructor() {
    super(
      "No API key provided. Pass apiKey or set the SCAVIO_API_KEY " +
        "environment variable. Get your free key at https://dashboard.scavio.dev",
    );
    this.name = "MissingAPIKeyError";
  }
}

/** The request could not reach the API (DNS, connection reset, TLS, ...). */
export class ScavioConnectionError extends ScavioError {
  constructor(message = "Connection error") {
    super(message);
    this.name = "ScavioConnectionError";
  }
}

/** The request did not complete within the configured timeout. */
export class ScavioTimeoutError extends ScavioError {
  constructor(message = "Request timed out") {
    super(message);
    this.name = "ScavioTimeoutError";
  }
}

export class InvalidAPIKeyError extends ScavioError {
  public readonly statusCode = 401;
  public readonly responseBody?: Record<string, unknown>;

  constructor(message = "Invalid API key", responseBody?: Record<string, unknown>) {
    super(message);
    this.name = "InvalidAPIKeyError";
    this.responseBody = responseBody;
  }
}

export class InsufficientCreditsError extends ScavioError {
  public readonly statusCode = 402;
  public readonly responseBody?: Record<string, unknown>;

  constructor(message = "Insufficient credits", responseBody?: Record<string, unknown>) {
    super(message);
    this.name = "InsufficientCreditsError";
    this.responseBody = responseBody;
  }
}

export class BadRequestError extends ScavioError {
  public readonly statusCode = 400;
  public readonly responseBody?: Record<string, unknown>;

  constructor(message = "Bad request", responseBody?: Record<string, unknown>) {
    super(message);
    this.name = "BadRequestError";
    this.responseBody = responseBody;
  }
}

export class NotFoundError extends ScavioError {
  public readonly statusCode = 404;
  public readonly responseBody?: Record<string, unknown>;

  constructor(message = "Not found", responseBody?: Record<string, unknown>) {
    super(message);
    this.name = "NotFoundError";
    this.responseBody = responseBody;
  }
}

export class RateLimitError extends ScavioError {
  public readonly statusCode = 429;
  public readonly responseBody?: Record<string, unknown>;

  constructor(message = "Rate limit exceeded", responseBody?: Record<string, unknown>) {
    super(message);
    this.name = "RateLimitError";
    this.responseBody = responseBody;
  }
}

export class ScavioAPIError extends ScavioError {
  public readonly statusCode: number;
  public readonly responseBody?: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    responseBody?: Record<string, unknown>,
  ) {
    super(`API error ${statusCode}: ${message}`);
    this.name = "ScavioAPIError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}
