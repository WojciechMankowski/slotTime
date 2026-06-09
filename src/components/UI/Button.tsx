import { ButtonProps } from "../../Types/Props";
import React from "react";
import { BUTTON_BASE, BUTTON_INTENT, ButtonIntent } from "./controlStyles";

const Button = ({
  type,
  onClick,
  className,
  disabled,
  name,
  id, text,
  intent,
}: ButtonProps) => {
  // Intencja z propa; gdy pominięty — shim kompatybilności czyta ją z className.
  const resolvedIntent: ButtonIntent =
    intent ??
    (className?.includes("primary")
      ? "primary"
      : "outline");

  // Pozostałe klasy = className bez słów-aliasów intencji (gdy intent wynikał z className).
  const restClassName = intent
    ? className ?? ""
    : (className ?? "").replace(/\b(primary|outline)\b/g, "").trim();

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${BUTTON_BASE} ${BUTTON_INTENT[resolvedIntent]} ${restClassName}`}
      disabled={disabled}
      name={name}
      id={id?.toString() ?? name}
    >
      {text}
    </button>
  );
};

export default Button;
