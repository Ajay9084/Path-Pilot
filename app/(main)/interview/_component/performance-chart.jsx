"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const PerformanceChart = ({ assessments }) => {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (assessments) {
      const formattedData = assessments.map((a) => ({
        date: format(new Date(a.createdAt), "MMM d, yyyy HH:mm"),
        score: a.quizScore,
      }))
      setChartData(formattedData)
    }
  }, [assessments])

  return (
    <Card className="bg-black text-white">
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">Performance Trend</CardTitle>
        <CardDescription>Your quiz score over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#ffffff" tick={{ fill: "#ffffff" }} />
              <YAxis domain={[0, 100]} stroke="#ffffff" tick={{ fill: "#ffffff" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-gray-800 border rounded-lg p-2 shadow-md text-white">
                        <p className="text-sm font-medium">Score: {payload[0].value}%</p>
                        <p className="text-xs">{payload[0].payload.date}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#ffffff" // White line
                strokeWidth={2}
                dot={{ stroke: "#ffffff", strokeWidth: 2, r: 3 }}
                animationDuration={1500} // Line drawing animation duration in ms
                animationEasing="ease-in-out" // Smooth easing
                isAnimationActive={true} // Enable animation
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default PerformanceChart
