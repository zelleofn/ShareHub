import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../context/AuthProvider";
import { useAuth } from "../context/AuthContext";
import { login as loginService } from "./auth";

jest.mock("../services/auth", () => ({
  login: jest.fn(),
  saveToken: jest.fn(),
  getToken: jest.fn(),
  removeToken: jest.fn(),
  register: jest.fn()
}));

describe("useAuth", () => {
  it("logs in successfully", async () => {
    const payload = {
      id: 1,
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01"
    };

    const token = `header.${btoa(JSON.stringify(payload))}.signature`;
    (loginService as jest.Mock).mockResolvedValue(token);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("test@test.com", "password");
    });

    expect(result.current.user!.email).toBe("test@test.com");

  });
});
