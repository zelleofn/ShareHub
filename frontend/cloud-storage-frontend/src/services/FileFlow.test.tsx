import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StoragePage from "../components/StoragePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const client = new QueryClient();

describe("File Lifecycle Flow", () => {
  it("uploads, lists, opens modal, and deletes a file", async () => {
    render(
      <QueryClientProvider client={client}>
        <StoragePage />
      </QueryClientProvider>
    );

    const file = new File(["hello"], "test.png", { type: "image/png"});
    await userEvent.upload(screen.getByTestId("file-input"), file);

    expect(await screen.findByTestId("test.png")).toBeInTheDocument();

    await userEvent.click(screen.getByText("test.png"));
    expect(await screen.findByText(/file details/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    expect(screen.queryByText("test.png")).not.toBeInTheDocument();
  });
});