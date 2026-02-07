import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index";

describe("Seeded Data Integration", () => {
  
  it("should login with the seeded Admin account", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@demo.com",
      password: "password123"
    });

    //Log body if it fails
    if (res.status !== 200) {
      console.log("Login Failed Body:", res.body);
    }

    expect(res.status).toBe(200);
    
    // Check if token exists in Body OR Cookie
    const hasTokenInBody = !!res.body.token;
    const hasTokenInCookie = res.headers['set-cookie'] && res.headers['set-cookie'][0].includes('token=');
    
    expect(hasTokenInBody || hasTokenInCookie).toBe(true);
  });

  it("should fetch the seeded 'Engineering Sprint' board", async () => {
    //Login
    const loginRes = await request(app).post("/auth/login").send({
      email: "admin@demo.com",
      password: "password123"
    });

    const cookies = loginRes.headers['set-cookie'];
    
    //Fetch Board using Cookie
    const res = await request(app)
      .get("/boards")
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    const demoBoard = res.body.find((b: any) => b.name === "Engineering Sprint");
    expect(demoBoard).toBeDefined();
  });
});