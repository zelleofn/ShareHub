import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/auth/login", async () => {
    return HttpResponse.json({
      token: "abc123",
      user: { id: 1, email: "test@test.com" }
    });
  }),

  http.post("/files/upload", async () => {
    return HttpResponse.json({
      id: "1",
      name: "test.png",
      size: 1000
    });
  }),

  http.get("/files", async () => {
    return HttpResponse.json([
      { id: "1", name: "test.png", size: 1000 }
    ]);
  }),

  http.delete("/files/1", async () => {
    return new HttpResponse(null, { status: 200 });
  })
];
