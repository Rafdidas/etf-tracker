"use client";
import { useQuery } from "@tanstack/react-query";
export const useFx = () => useQuery({ queryKey: ["fx"], queryFn: () => fetch("/api/fx").then(r => r.json()) });
