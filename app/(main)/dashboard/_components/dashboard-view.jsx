"use client"

import React from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  Brain,
  BriefcaseIcon,
  LineChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const DashboardView = ({ insights }) => {
  // Transform salary data for the chart
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }))

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" }
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" }
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" }
      default:
        return { icon: LineChart, color: "text-gray-500" }
    }
  }

  const { icon: OutlookIcon, color: outlookColor } = getMarketOutlookInfo(
    insights.marketOutlook
  )

  // Format dates
  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy")
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  )

  return (
    <div className="space-y-6">
      {/* Last Updated */}
      <div className="flex justify-between items-center">
        <Badge variant="outline">Last Updated: {lastUpdatedDate}</Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Outlook */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Outlook</CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutlook}</div>
            <p className="text-xs text-muted-foreground">
              Next update {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        {/* Industry Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Industry Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress value={insights.growthRate} className="mt-2" />
          </CardContent>
        </Card>

        {/* Demand Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {insights.topSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Salary Ranges by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
          <ChartContainer className="h-[400px] rounded-xl bg-black p-4">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={salaryData}
      margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
      barGap={8} // Gap between bars
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
      <XAxis dataKey="name" stroke="#ccc" tick={{ fill: "#fff" }} />
      <YAxis stroke="#ccc" tick={{ fill: "#fff" }} />
      <Tooltip content={<ChartTooltipContent />} />

      {/* Animated bars with smooth growth */}
      <Bar
        dataKey="min"
        radius={[10, 10, 10, 10]}
        fill="#93c5fd"
        animationDuration={1500}
        animationEasing="ease-in-out"
        isAnimationActive={true}
      />
      <Bar
        dataKey="median"
        radius={[10, 10, 10, 10]}
        fill="#3b82f6"
        animationDuration={1500}
        animationEasing="ease-in-out"
        isAnimationActive={true}
      />
      <Bar
        dataKey="max"
        radius={[10, 10, 10, 10]}
        fill="#1e40af"
        animationDuration={1500}
        animationEasing="ease-in-out"
        isAnimationActive={true}
      />
    </BarChart>
  </ResponsiveContainer>
</ChartContainer>
          </div>
        </CardContent>
      </Card>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Card>
        <CardHeader>
          <CardTitle>Key Industry Trends</CardTitle>
          <CardDescription>
            Current trends shaping the industry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {insights.keyTrends.map((trend, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="h-2 w-2 mt-2 rounded-full bg-primary"/>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

<Card>
        <CardHeader>
          <CardTitle>Recommended Skills</CardTitle>
          <CardDescription>
            Skills to consider developing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights.recommendedSkills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
</div>
    </div>
  )
}

export default DashboardView
