/**
 * Sendgo API 호출 실패 시 발생하는 에러.
 *
 * @example
 * try {
 *   await sendgo.alimtalk.send({ ... });
 * } catch (e) {
 *   if (e instanceof SendgoError) {
 *     console.error(e.errorCode, e.statusCode);
 *   }
 * }
 */
export class SendgoError extends Error {
  /** HTTP 상태 코드 */
  readonly statusCode: number;
  /** Sendgo 에러 코드 (예: 'INVALID_TEMPLATE_CODE') */
  readonly errorCode: string | null;
  /** API 엔드포인트 */
  readonly endpoint: string;
  /** API 버전 */
  readonly apiVersion: string;
  /** 원본 응답 바디 */
  readonly responseBody: unknown;

  constructor(options: {
    message: string;
    statusCode: number;
    errorCode: string | null;
    endpoint: string;
    apiVersion: string;
    responseBody: unknown;
  }) {
    super(options.message);
    this.name = 'SendgoError';
    this.statusCode = options.statusCode;
    this.errorCode = options.errorCode;
    this.endpoint = options.endpoint;
    this.apiVersion = options.apiVersion;
    this.responseBody = options.responseBody;
  }

  static fromResponse(
    statusCode: number,
    body: Record<string, unknown>,
    endpoint: string,
    apiVersion: string,
  ): SendgoError {
    const errorCode = (body.code as string) ?? null;
    const errorMessage = (body.message as string) ?? 'Unknown error';
    const message = `HTTP ${statusCode}${errorCode ? ` [${errorCode}]` : ''} ${errorMessage}`;

    return new SendgoError({ message, statusCode, errorCode, endpoint, apiVersion, responseBody: body });
  }
}
