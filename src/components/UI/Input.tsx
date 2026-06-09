import { InputProps } from "../../Types/Props";
import React from "react";
import { FIELD_CLASS } from "./controlStyles";

const Input = ({
  type,
  value,
  onChange,
  className,
  placeholder,
  disabled,
  label, // Pamiętaj o renderowaniu labela, jeśli go przekazujesz!
  name,
  id,
}: InputProps) => {

  // POPRAWKA: Wyciągamy wartość z eventu i przekazujemy ją do onChange
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? Number(event.target.value) : event.target.value;
    
    // Wywołujemy onChange zgodnie z definicją w InputProps: (value, name?)
    onChange(newValue, name);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label htmlFor={id?.toString() ?? name} className="text-[0.85rem] text-(--text-muted) font-medium mb-0.5 block">{label}</label>}
      <input
        min={1}
        type={type}
        value={value}
        onChange={handleChange} // Tutaj przekazujemy naszą funkcję pośredniczącą
        className={`${FIELD_CLASS} ${className || ''}`}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        id={id?.toString() ?? name}
      />
    </div>
  );
};

export default Input;