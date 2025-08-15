import request from "supertest";
import { createServer } from "http";
import express from "express";
import { registerRoutes } from "../server/routes";

let server: any;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  const http = await registerRoutes(app);
  server = http.listen(0);
});
afterAll(() => server.close());

test("GET /api/auth/user returns mock", async () => {
  const res = await request(server).get("/api/auth/user");
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty("email");
});