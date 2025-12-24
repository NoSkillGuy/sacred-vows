import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLanguage } from "./useLanguage";

describe("useLanguage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  it("should initialize with default language (en)", () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.currentLang).toBe("en");
    expect(Object.keys(result.current.translations).length).toBeGreaterThan(0);
  });

  it("should initialize with language from localStorage", () => {
    localStorage.setItem("wedding-lang", "hi");

    const { result } = renderHook(() => useLanguage());

    expect(result.current.currentLang).toBe("hi");
  });

  it("should update language when updateLanguage is called", () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.updateLanguage("te");
    });

    expect(result.current.currentLang).toBe("te");
    expect(localStorage.getItem("wedding-lang")).toBe("te");
    expect(document.documentElement.lang).toBe("te");
  });

  it("should get translation for current language", () => {
    const { result } = renderHook(() => useLanguage());

    const translation = result.current.getTranslation("nav.home");

    expect(typeof translation).toBe("string");
    expect(translation.length).toBeGreaterThan(0);
  });

  it("should return empty string for non-existent translation key", () => {
    const { result } = renderHook(() => useLanguage());

    const translation = result.current.getTranslation("non.existent.key");

    expect(translation).toBe("");
  });

  it("should update document language attribute", () => {
    const { result } = renderHook(() => useLanguage());

    act(() => {
      result.current.updateLanguage("hi");
    });

    expect(document.documentElement.lang).toBe("hi");
  });
});
