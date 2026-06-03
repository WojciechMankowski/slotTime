import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportDailyTable from "../../components/reports/ReportDailyTable";
import type { ReportDayRow } from "../../hooks/useReports";

const makeRow = (overrides: Partial<ReportDayRow> = {}): ReportDayRow => ({
  date: "2025-06-01",
  total: 10,
  available: 3,
  pending_confirmation: 2,
  confirmed: 2,
  completed: 2,
  cancelled: 1,
  cancel_pending: 0,
  inbound: 5,
  outbound: 3,
  any: 2,
  utilization_pct: 70,
  ...overrides,
});

describe("ReportDailyTable", () => {
  it("returns null when rows array is empty", () => {
    const { container } = render(<ReportDailyTable rows={[]} lang="pl" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a row with the date", () => {
    render(<ReportDailyTable rows={[makeRow()]} lang="pl" />);
    expect(screen.getByText("2025-06-01")).toBeInTheDocument();
  });

  it("renders total count", () => {
    render(<ReportDailyTable rows={[makeRow({ total: 42 })]} lang="pl" />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders utilization percentage badge", () => {
    render(<ReportDailyTable rows={[makeRow({ utilization_pct: 70 })]} lang="pl" />);
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("renders multiple rows", () => {
    const rows = [
      makeRow({ date: "2025-06-01" }),
      makeRow({ date: "2025-06-02" }),
      makeRow({ date: "2025-06-03" }),
    ];
    render(<ReportDailyTable rows={rows} lang="pl" />);
    expect(screen.getByText("2025-06-01")).toBeInTheDocument();
    expect(screen.getByText("2025-06-02")).toBeInTheDocument();
    expect(screen.getByText("2025-06-03")).toBeInTheDocument();
  });

  it("utilization badge has emerald class for >= 80%", () => {
    const { container } = render(
      <ReportDailyTable rows={[makeRow({ utilization_pct: 85 })]} lang="pl" />
    );
    expect(container.innerHTML).toContain("emerald");
  });

  it("utilization badge has amber class for >= 50% and < 80%", () => {
    const { container } = render(
      <ReportDailyTable rows={[makeRow({ utilization_pct: 55 })]} lang="pl" />
    );
    expect(container.innerHTML).toContain("amber");
  });

  it("utilization badge has red class for < 50%", () => {
    const { container } = render(
      <ReportDailyTable rows={[makeRow({ utilization_pct: 30 })]} lang="pl" />
    );
    expect(container.innerHTML).toContain("red");
  });

  it("sums pending_confirmation + confirmed for active column", () => {
    const row = makeRow({ pending_confirmation: 4, confirmed: 2 });
    render(<ReportDailyTable rows={[row]} lang="pl" />);
    // active = 4 + 2 = 6
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("renders with English labels", () => {
    render(<ReportDailyTable rows={[makeRow()]} lang="en" />);
    expect(screen.getByText("2025-06-01")).toBeInTheDocument();
  });
});
