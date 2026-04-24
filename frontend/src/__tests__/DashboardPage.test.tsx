import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "../pages/DashboardPage";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn().mockImplementation((url: string) => {
      if (url === "/runs") return Promise.resolve({ data: [] });
      if (url === "/metrics")
        return Promise.resolve({ data: { runs_total: 0, alerts_sent: 0 } });
      return Promise.resolve({ data: [] });
    }),
  },
}));

describe("DashboardPage", () => {
  it("renders metrics heading", async () => {
    render(<DashboardPage />);
    expect(await screen.findByText("Metrics")).toBeInTheDocument();
  });
});
