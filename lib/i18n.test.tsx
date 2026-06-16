import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { LanguageProvider, useLang } from "./i18n";

function Probe() {
  const { lang, setLang, t } = useLang();
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="val">{t({ vi: "Xin chào", en: "Hello" })}</span>
      <button onClick={() => setLang(lang === "vi" ? "en" : "vi")}>toggle</button>
    </div>
  );
}

describe("i18n", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to vi and translates", () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    expect(screen.getByTestId("lang").textContent).toBe("vi");
    expect(screen.getByTestId("val").textContent).toBe("Xin chào");
  });

  it("toggles language and persists to localStorage", () => {
    render(<LanguageProvider><Probe /></LanguageProvider>);
    act(() => { screen.getByText("toggle").click(); });
    expect(screen.getByTestId("lang").textContent).toBe("en");
    expect(screen.getByTestId("val").textContent).toBe("Hello");
    expect(localStorage.getItem("lang")).toBe("en");
  });
});
