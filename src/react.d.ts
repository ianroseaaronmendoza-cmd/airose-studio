// src/react.d.ts

import * as React from "react";

// Ensure the JSX namespace is available globally
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
