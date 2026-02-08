
import request from "supertest";
import app from "../src/app";
import { describe, it, expect } from "vitest";

describe("Auth", () => {

  it("registers and logs in a user", async () => {
    const email = `t${Date.now()}@test.com`;
    const res1 = await request(app)
      .post("/auth/register")
      .send({ email, password: "password" });
    expect(res1.status).toBe(200);
    expect(res1.body.token).toBeTruthy();

    const res2 = await request(app)
      .post("/auth/login")
      .send({ email, password: "password" });
    expect(res2.status).toBe(200);
    expect(res2.body.token).toBeTruthy();
  });
});
