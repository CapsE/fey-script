import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Rollable } from "./Rollable";
import { Context } from "../Context";

describe("Rollable", () => {
  it("renders value and handles click", () => {
    const onDiceRoll = jest.fn();
    const { getByText } = render(
      <Context.Provider value={{ onDiceRoll }}>
        <Rollable value="1d6" />
      </Context.Provider>
    );
    const link = getByText("1d6");
    fireEvent.click(link);
    expect(onDiceRoll).toHaveBeenCalledWith("1d6");
  });
});