import React from "react";
import Select, { StylesConfig, Props } from "react-select";

const colourStyles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "transparent",
    border: "1px solid rgba(0, 178, 255, 1)",
    borderRadius: 0,
    padding: ".25rem",
    "&:hover": {
      border: "1px solid rgba(0, 178, 255, 1)",
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? undefined
        : isSelected
        ? "rgba(0, 178, 255, 1)"
        : isFocused
        ? "rgba(0, 178, 255, .4)"
        : undefined,
      color: isDisabled
        ? "rgba(0, 178, 255, .5)"
        : isSelected
        ? "white"
        : isFocused
        ? "white"
        : "rgba(0, 178, 255, 1)",
      cursor: isDisabled ? "not-allowed" : "default",
    };
  },
  input: (styles) => ({
    ...styles,
    background: "transparent",
    fontFamily: "Dosis",
    color: "rgba(0, 178, 255, 1)",
  }),
  placeholder: (styles) => ({ ...styles, color: "rgba(0, 178, 255, 1)" }),
  singleValue: (styles, { data }) => ({
    ...styles,
    fontFamily: "Dosis",
    color: "rgba(0, 178, 255, 1)",
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: "rgba(0, 178, 255, 1)",
  }),
  multiValueLabel: (styles) => ({
    ...styles,
    color: "rgba(0, 178, 255, 1)",
  }),
  multiValueRemove: (styles) => ({
    ...styles,
    color: "rgba(0, 178, 255, 1)",
    "&:hover": {
      background: "rgba(0, 178, 255, 1)",
      color: "white",
      borderRadius: 0,
    },
  }),
  clearIndicator: (styles) => ({
    ...styles,
    color: "rgba(0, 178, 255, 1)",
    cursor: "pointer",
    "&:hover": {
      color: "white",
    },
  }),
  menu: (styles) => ({
    ...styles,
    fontFamily: "Dosis",
    color: "rgba(0, 178, 255, 1)",
    background: "rgba(22, 25, 34, 1)",
    border: "1px solid rgba(0, 178, 255, 1)",
  }),
  multiValue: (styles, { data }) => ({
    ...styles,
    fontFamily: "Dosis",
    color: "rgba(0, 178, 255, 1)",
    background: "transparent",
    border: "1px solid rgba(0, 178, 255, 1)",
  }),
};

export const SelectComponent = (props: Props) => {
  return <Select {...props} styles={colourStyles} />;
};
