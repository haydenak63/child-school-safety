import { describe, expect, it } from "vitest";
import { cameraPageOrigin, firstHeaderValue } from "@/lib/env";

describe("forwarded headers", () => {
  it("uses the first value from a comma-separated proxy header", () => {
    expect(firstHeaderValue("https, http")).toBe("https");
    expect(firstHeaderValue("css.iqpigeon.com, localhost")).toBe("css.iqpigeon.com");
    expect(firstHeaderValue(null)).toBe("");
  });
});

describe("camera page origin", () => {
  it("prefers HTTPS so Chrome on phones can prompt for the camera", () => {
    const request = new Request("http://127.0.0.1/api/enrollment/create", {
      headers: {
        origin: "http://css.iqpigeon.com",
      },
    });
    const previous = process.env.NEXT_PUBLIC_APP_URL;
    process.env.NEXT_PUBLIC_APP_URL = "https://css.iqpigeon.com";
    try {
      expect(cameraPageOrigin(request)).toBe("https://css.iqpigeon.com");
    } finally {
      process.env.NEXT_PUBLIC_APP_URL = previous;
    }
  });
});
