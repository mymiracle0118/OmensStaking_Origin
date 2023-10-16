import React, { ButtonHTMLAttributes } from "react";
import { useDigsite } from "../hooks/use-current-digsite";

interface ButtonProps {
  text?: string;
  onClick?: any;
  href?: any;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  classNames?: string;
}

export const Button = (
  props: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const { onClick, text, textColor, bgColor, classNames, ...rest } = props;
  const { currentDigsite } = useDigsite();

  return (
    <button
      onClick={onClick}
      {...rest}
      className={`flex items-center justify-center flex-1 py-2.5 px-5 outline-none border-${
        currentDigsite ? `${currentDigsite}OffsetAccent` : "primary"
      } border-special-sm rounded-lg mx-2 bg-black bg-opacity-60 ${classNames}`}
      style={{ background: "rgba(0, 0, 0, .6)" }}
    >
      <p className="text-4.5xl font-poppins font-bold uppercase">{text}</p>
    </button>
  );
};

export const FilledButton = (
  props: ButtonProps & ButtonHTMLAttributes<HTMLButtonElement>
) => {
  const { onClick, text, textColor, bgColor, classNames, ...rest } = props;

  return (
    <button
      onClick={onClick}
      {...rest}
      className={`flex items-center justify-center flex-1 py-2.5 px-5 outline-none border-special border-special-sm rounded-2.5xl shadow-box mx-2 ${classNames}`}
      style={{
        background: "url(mask.jpg)",
        backgroundPosition: "50%",
        backgroundSize: "cover",
      }}
    >
      <p
        className="text-4.5xl font-poppins font-bold text-black uppercase"
        style={{ WebkitTextFillColor: "black", backgroundImage: "none" }}
      >
        {text}
      </p>
    </button>
  );
};
