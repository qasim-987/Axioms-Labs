"use client";
import { Component, type ReactNode } from "react";

/** A failed transition shell must not leave an invisible input-blocking curtain. */
export default class TransitionErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {
    document.querySelector('[data-transition-content]')?.removeAttribute('inert');
    window.dispatchEvent(new CustomEvent('page-transition:resume'));
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
