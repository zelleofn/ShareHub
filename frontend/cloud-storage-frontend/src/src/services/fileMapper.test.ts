import { mapFileToDetails } from "../utils/fileMapper";
import type { File } from "../types/file";

describe("mapFileToDetails", () => {
  it("maps File to FileDetails", () => {
    const file: File = {
      id: "123",
      owner: "user123",
      filename: "test.png",
      mimetype: "image/png",
      size: 5000,
      isPublic: false,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      versions: []
    };

    const result = mapFileToDetails(file);

    expect(result.id).toBe("123");
    expect(result.name).toBe("test.png");
    expect(result.size).toBe(5000);
    expect(result.type).toBe("image");
  });
});
