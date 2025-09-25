"use client";
import { useQuery } from "@tanstack/react-query";
export const useQuote = (symbol: string) =>
  useQuery({ queryKey: ["quote", symbol], queryFn: () => fetch(`/api/quote?symbol=${symbol}`).then(r => r.json()), enabled: !!symbol });
