"use client"

import React from "react"
import { Tooltip as RechartsTooltip } from "recharts"

// Container to wrap charts
export function ChartContainer({ children, className }) {
  return <div className={`w-full h-full ${className}`}>{children}</div>
}

// Shadcn-styled tooltip wrapper
export function ChartTooltip(props) {
  return <RechartsTooltip {...props} />
}

// Custom content for the tooltip
export function ChartTooltipContent({ label, payload }) {
  if (!payload || payload.length === 0) return null;

  return (
    <div className="bg-black hover:bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-900 transition-colors duration-200">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className="flex justify-between">
          <span className="capitalize">{entry.name}:</span>
          <span>${entry.value}k</span>
        </div>
      ))}
    </div>
  )
}

