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

export class InvalidAPIKeyError extends ScavioError {
  constructor(message = "Invalid API key") {
    super(message);
    this.name = "InvalidAPIKeyError";
  }
}

export class InsufficientCreditsError extends ScavioError {
  constructor(message = "Insufficient credits") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export class BadRequestError extends ScavioError {
  constructor(message = "Bad request") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class RateLimitError extends ScavioError {
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ScavioAPIError extends ScavioError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(`API error ${statusCode}: ${message}`);
    this.name = "ScavioAPIError";
    this.statusCode = statusCode;
  }
}
