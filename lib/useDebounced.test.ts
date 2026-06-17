import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounced } from "./useDebounced";

describe("useDebounced", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns the initial value immediately", () => {
    const { result } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    expect(result.current).toBe("a");
  });

  it("does not update before the delay elapses", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current).toBe("a");
  });

  it("updates to the latest value after the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("ab");
  });

  it("only emits the final value when changes arrive faster than the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounced(v, 200), {
      initialProps: { v: "a" },
    });
    rerender({ v: "ab" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ v: "abc" });
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("a"); // timer reset by second change, not yet elapsed
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe("abc"); // final value after full delay from last change
  });
});
