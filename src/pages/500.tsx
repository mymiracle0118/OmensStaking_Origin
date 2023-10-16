import React from "react";
import { ErrorScreen } from "../components/error";

export default function Error404Page() {
  return (
    <ErrorScreen
      code={500}
      message={`Internal Server Error, SDK is probably fixing this.`}
    />
  );
}
