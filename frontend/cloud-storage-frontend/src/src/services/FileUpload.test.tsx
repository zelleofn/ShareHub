import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Upload from "../components/Upload";
import axios from "../services/api";
import type { Mocked } from "jest-mock";

const mockedAxios = axios as Mocked<typeof axios>;

jest.mock("../services/api");

describe("FileUpload Component", () => {
  it("uploads a file", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });

    render(<Upload />);

    const file = new File(["hello"], "test.txt", { type: "text/plain" });

    const input = screen.getByTestId("file-input");
    await userEvent.upload(input, file);

    expect(axios.post).toHaveBeenCalled();
  });
});
