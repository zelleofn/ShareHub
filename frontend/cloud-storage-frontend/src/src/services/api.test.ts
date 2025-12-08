import axios from "axios";
import api from "../services/api";
import type { Mocked } from "jest-mock";

const mockedAxios = axios as Mocked<typeof axios>;


jest.mock("axios");

describe("API service", () => {
  it("calls the correct endpoint", async () => {
    mockedAxios.get.mockResolvedValue({ data: { ok: true } });

    const res = await api.get("/storage/statistics");

    expect(axios.get).toHaveBeenCalledWith(
      "/storage/statistics",
      expect.any(Object)
    );
    expect(res.data.ok).toBe(true);
  });

  it("handles errors", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network error"));
    await expect(api.get("/storage/statistics")).rejects.toThrow("Network error");
  });
});
