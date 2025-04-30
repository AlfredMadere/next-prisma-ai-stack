import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ActionResult } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function success<T>(data: T): ActionResult<T> {
  return { data, error: null };
}

function failure<T = unknown>(error: unknown): ActionResult<T> {
  const message = error instanceof Error ? error.message : String(error);
  console.log("error:", message);
  return { data: null, error: message };
}
