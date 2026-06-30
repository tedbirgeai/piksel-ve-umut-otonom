// components/ErrorBoundary.tsx
"use client";

import React from "react";

/**
 * Beyaz ekran / tıkanıklık önleyici.
 * Alt ağaçta bir hata olursa uygulamayı çökertmek yerine
 * markaya uygun, geri dönüş yolu olan bir ekran gösterir.
 */
interface State {
  hasError: boolean;
  message: string;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[calc(100vh-58px)] flex-col items-center justify-center bg-paper px-6 text-center dark:bg-[#0C1614]">
        <div className="grid h-14 w-14 grid-cols-3 grid-rows-3 gap-1">
          <span />
          <span />
          <span className="rounded-sm bg-hope" />
          <span />
          <span className="rounded-sm bg-hope" />
          <span className="rounded-sm bg-forest" />
          <span className="rounded-sm bg-hope" />
          <span className="rounded-sm bg-forest" />
          <span className="rounded-sm bg-forest" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tightest text-forest dark:text-[#34D0B6]">
          Bir şeyler ters gitti
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Endişelenme — verilerin güvende. Sayfayı yenileyip tekrar deneyebilir
          ya da ana sayfaya dönebilirsin.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-forest-600"
          >
            Tekrar dene
          </button>
          <a
            href="/"
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-forest transition-colors hover:bg-sand dark:border-[#21342F]"
          >
            Ana sayfa
          </a>
        </div>
      </div>
    );
  }
}
