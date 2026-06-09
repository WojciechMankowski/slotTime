import { SelectProps } from "../../Types/Props";
import React, { useState } from "react";
import { FIELD_CLASS } from "./controlStyles";

const Select = ({
  options,
  onChange,
  className,
  disabled,
  name,
  id,
  defaultValue,
}: SelectProps) => {
  const initialValue = defaultValue ?? (typeof options[0] === "object" && options[0] !== null ? (options[0] as any).value : options[0]) ?? "";
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <select
      onChange={handleChange}
      className={`${FIELD_CLASS} ${className || ""}`}
      name={name}
      id={id?.toString() ?? name}
      value={value}
      disabled={disabled}
    >
      {options.map((option, index) => {
        const isObject = typeof option === "object" && option !== null;
        const optValue = isObject ? (option as any).value : option;
        const optLabel = isObject ? (option as any).label : option;
        return (
          <option key={index} value={optValue}>
            {optLabel}
          </option>
        );
      })}
    </select>
  );
};

export default Select;