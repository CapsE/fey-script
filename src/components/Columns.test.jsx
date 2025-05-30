import React from "react"
import { render, screen } from "@testing-library/react"
import Columns from "./Columns"

// Mock Await and renderMDX for isolation
jest.mock("./Await", () => ({
  Await: ({ promise }) => <div data-testid="await">{promise && "Loaded"}</div>
}))
jest.mock("../util/renderMDX", () => ({
  renderMDX: jest.fn(() => Promise.resolve(<div>MDX Content</div>))
}))

describe("Columns", () => {
  it("renders with default props", async () => {
    render(<Columns value="Test" context={{}} />)
    expect(screen.getByTestId("await")).toBeInTheDocument()
  })
})
