import React from "react";

export const ErrorScreen = (props: { code: number; message: string }) => {
  const { code, message } = props;
  return (
    <div className="w-scree h-screen bg-secondary flex flex-col items-center justify-center">
      <div className="flex items-center">
        <p className="text-4xl font-bebas tracking-spaced text-primary p-2 mr-2 border-r border-primary">
          {code}
        </p>
        <p className="text-lg font-viet uppercase tracking-spaced text-primary">
          {message}
        </p>
      </div>
    </div>
  );
};
