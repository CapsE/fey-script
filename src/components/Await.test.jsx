import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Await } from "./Await";

describe("Await", () => {
  it("renders fallback and then resolved content", async () => {
    const promise = Promise.resolve(<div>Loaded</div>);
    const { getByText } = render(<Await promise={promise} fallback="Loading..." />);
    expect(getByText("Loading...")).toBeInTheDocument();
    await waitFor(() => getByText("Loaded"));
  });

  it("renders error on rejection", async () => {
    const promise = Promise.reject(new Error("fail"));
    const { findByText } = render(<Await promise={promise} />);
    expect(await findByText(/Error:/)).toBeInTheDocument();
  });
});