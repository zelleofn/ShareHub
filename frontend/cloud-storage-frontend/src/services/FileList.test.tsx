import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileListView from "../components/FileListView";

const mockFiles = [
  {
    id: "1",
    name: "file1.png",
    size: 1000,
    uploadedAt: "",
    type: "",
    sharingStatus: "",
    versionCount: 1,
    mimetype: "",
  },
  {
    id: "2",
    name: "file2.jpg",
    size: 2000,
    uploadedAt: "",
    type: "",
    sharingStatus: "",
    versionCount: 1,
    mimetype: "",
  },
];

describe("FileListView Component", () => {
  it("renders files", () => {
    render(<FileListView files={mockFiles} />);

    expect(screen.getByText("file1.png")).toBeInTheDocument();
    expect(screen.getByText("file2.jpg")).toBeInTheDocument();
  });

  it("calls onFileClick when file is clicked", async () => {
    const onClick = jest.fn();
    render(<FileListView files={mockFiles} onFileClick={onClick} />);

    await userEvent.click(screen.getByText("file1.png"));

    expect(onClick).toHaveBeenCalledWith(mockFiles[0]);
  });
});
