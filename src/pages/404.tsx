import React from "react";
import { ErrorScreen } from "../components/error";

export default function Error404Page() {
  return <ErrorScreen code={404} message={`Page not found`} />;
}
