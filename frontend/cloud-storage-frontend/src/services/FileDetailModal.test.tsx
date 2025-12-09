import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileDetailModal from "../components/FileDetailModal";

const mockFile = {
  id: "1",
  name: "test.png",
  size: 1000,
  uploadedAt: "",
  type: "image/png",
  sharingStatus: "private",
  versionCount: 1,
  mimetype: "image/png",
};

describe("FileDetailModal", () => {
  it("renders file details", () => {
    render(
      <FileDetailModal
        isOpen={true}
        fileDetails={mockFile}
        onClose={() => {}}
      />
    );

    expect(screen.getByText("test.png")).toBeInTheDocument();
  });

  it("calls onClose", async () => {
    const onClose = jest.fn();

    render(
      <FileDetailModal
        isOpen={true}
        fileDetails={mockFile}
        onClose={onClose}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
