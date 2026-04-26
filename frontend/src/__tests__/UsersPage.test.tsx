import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { UsersPage } from "../pages/UsersPage";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn(),
    delete: vi.fn(),
  },
  getToken: () => "fake-token",
}));

describe("UsersPage", () => {
  it("renders users table section", () => {
    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Add user/i)).toBeInTheDocument();
  });
});
