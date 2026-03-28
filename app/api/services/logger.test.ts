import { Logger, LogLevel, createLogger } from "./logger";

describe("Logger", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    Reflect.set(Logger, "instance", null);
  });

  it("throws when file output is configured without a file path", () => {
    expect(() => new Logger({ output: "file" })).toThrow(
      'File path is required when output includes "file"',
    );
  });

  it("filters messages below the configured minimum level", () => {
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    const logger = new Logger();

    logger.debug("hidden debug");
    logger.info("visible info");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0]?.[0]).toContain("visible info");
  });

  it("emits JSON logs with structured data", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const logger = new Logger({ format: "json" });

    logger.info("structured log", { requestId: "req-1" });

    const payload = JSON.parse(String(infoSpy.mock.calls[0]?.[0])) as {
      message: string;
      level: string;
      data: { requestId: string };
      timestamp: string;
    };

    expect(payload.message).toBe("structured log");
    expect(payload.level).toBe("INFO");
    expect(payload.data).toEqual({ requestId: "req-1" });
    expect(payload.timestamp).toBeTruthy();
  });

  it("updates configuration at runtime", () => {
    const debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    const logger = new Logger({ minLevel: LogLevel.ERROR });

    logger.debug("before configure");
    logger.configure({ minLevel: LogLevel.DEBUG, includeTimestamp: false });
    logger.debug("after configure");

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(String(debugSpy.mock.calls[0]?.[0])).toContain("after configure");
    expect(logger.getConfig()).toMatchObject({
      minLevel: LogLevel.DEBUG,
      includeTimestamp: false,
    });
  });

  it("creates separate instances with createLogger and stable singleton instances", () => {
    const created = createLogger({ minLevel: LogLevel.WARN });
    const singletonA = Logger.getInstance({ minLevel: LogLevel.DEBUG });
    const singletonB = Logger.getInstance({ minLevel: LogLevel.ERROR });

    expect(created).toBeInstanceOf(Logger);
    expect(created).not.toBe(singletonA);
    expect(singletonA).toBe(singletonB);
  });
});
