"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QuickActionDock } from "./ui/QuickActionDock";
import { CommandPalette } from "./ui/CommandPalette";
import { BarcodeScanner } from "./BarcodeScanner";

/**
 * Interactive Client wrapper for Dashboard actions (Command Palette + Barcode Scanner + Quick Dock).
 * @returns {JSX.Element} Rendered interactive wrapper.
 */
export function DashboardInteractiveWrapper() {
  const [is_palette_open, set_is_palette_open] = useState(false);

  return (
    <>
      <QuickActionDock
        onOpenCommandPalette={() => set_is_palette_open(true)}
      />

      <CommandPalette
        isOpen={is_palette_open}
        onClose={() => set_is_palette_open(false)}
      />
    </>
  );
}
