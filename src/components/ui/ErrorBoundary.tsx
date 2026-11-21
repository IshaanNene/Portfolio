"use client";

import { Component, type ReactNode } from "react";

/** Catches render errors in fragile subtrees (WebGL) and shows a fallback. */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[diary] 3D scene failed, showing fallback:", error);
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
