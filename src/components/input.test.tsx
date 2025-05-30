import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Input } from "./input";
import { Context } from "../Context";

describe("Input", () => {
  it("renders and updates value", () => {
    const onChange = jest.fn();
    const context = {
      data: {},
      onChange,
      eventTarget: {},
    };
    const { getByLabelText } = render(
      <Context.Provider value={context}>
        <Input name="test" label="Test" value="42" />
      </Context.Provider>
    );
    const input = getByLabelText("Test");
    fireEvent.change(input, { target: { value: "43" } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalled();
  });
});