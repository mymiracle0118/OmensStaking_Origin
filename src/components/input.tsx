import React, { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

interface InputProps {
  id: string;
  placeholder?: string;
  value?: string | number;
  label?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  type?: HTMLInputTypeAttribute;
}

export const Input = (
  props: InputProps & React.HTMLProps<HTMLInputElement>
) => {
  const { id, placeholder, value, onChange, label, type, ...rest } = props;
  return (
    <div className="flex flex-col">
      <label htmlFor="id" className="font-bebas tracking-spaced text-primary">
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        className="px-4 py-2 bg-secondary select-none outline-none text-primary border border-primary text-lg"
        {...rest}
      />
    </div>
  );
};
