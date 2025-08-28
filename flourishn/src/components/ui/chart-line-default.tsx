"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { getOverallViews, getOverallBookmarks, getOverallClicks } from "@/api/apiClient"

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type MetricType = "Views" | "Clicks" | "Bookmarks"

type ChartDataItem = {
  day: string
  value: number
}

export function ChartLineDefault() {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("Views")
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [trending, setTrending] = useState("")
  const [difference, setDifference] = useState(0)

  const fetchMetricData = async (metric: MetricType) => {
    try {
      let response

      if (metric === "Views") {
        response = await getOverallViews()
        if (!response) return
        const chartReadyData = response.dailyViews.map((d: { day: string; total: number }) => ({
          day: d.day,
          value: d.total,
        }))
        setChartData(chartReadyData)
        setTrending(response.summary.percentChange >= 0 ? "up" : "down")
        setDifference(response.summary.percentChange)
      } else if (metric === "Clicks") {
        response = await getOverallClicks()
        if (!response) return
        const chartReadyData = response.data.map((d: { day: string; total: number }) => ({
          day: d.day,
          value: d.total,
        }))
        setChartData(chartReadyData)
        setTrending(response.weekComparison.trend)
        setDifference(response.weekComparison.difference)
      } else if (metric === "Bookmarks") {
        response = await getOverallBookmarks()
        if (!response) return
        const chartReadyData = response.data.map((d: { day: string; total: number }) => ({
          day: d.day,
          value: d.total,
        }))
        setChartData(chartReadyData)
        setTrending(response.weekComparison.trend)
        setDifference(response.weekComparison.difference)
      }
    } catch (error) {
      console.error("Error fetching metric data:", error)
      setChartData([])
      setTrending("")
    }
  }

  useEffect(() => {
    fetchMetricData(selectedMetric)
  }, [selectedMetric])

  const chartConfig: ChartConfig = {
    value: {
      label: selectedMetric,
      color: "#1f98f4",
    },
  }

  const metrics: MetricType[] = ["Views", "Clicks", "Bookmarks"]

  return (
    <Card className="bg-black border-none text-white">
      {/* Metric selectors */}
      <div className="flex justify-center gap-12 mb-4">
        {metrics.map((metric) => (
          <h1
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`text-xl font-bold cursor-pointer transition-colors ${selectedMetric === metric
              ? "text-[#1f98f4]"
              : "text-white hover:text-[#1f98f4]"
              }`}
          >
            {metric}
          </h1>
        ))}
      </div>

      <CardContent className="bg-black flex justify-center">
        <div className="w-[300px] sm:w-[400px] lg:w-[700px] h-[200px] sm:h-[250px] lg:h-[400px]">
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-cartesian-axis-tick_text]:fill-white [&_.recharts-cartesian-grid_line]:stroke-gray-700"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 12, bottom: 20, left: 12 }}
              >
                <CartesianGrid vertical={false} stroke="#333" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "white", fontSize: 12 }}
                  interval={0}
                  tickFormatter={(str: string) => {
                    const d = new Date(str);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                    // e.g. "Aug 26"
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "white" }}
                  domain={[0, 'dataMax + 10']}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Line
                  dataKey="value"
                  type="monotone"
                  stroke="#1f98f4"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm text-white">
        <div className="flex gap-2 leading-none font-medium items-center">
          {trending === "up" ? (
            <>
              Trending up by {difference} this week <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : trending === "down" ? (
            <>
              Trending down by {Math.abs(difference)} this week <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />
            </>
          ) : (
            <>No change this week</>
          )}
        </div>

        <div className="text-gray-400 leading-none">
          Showing {selectedMetric.toLowerCase()} for the last 6 days
        </div>
      </CardFooter>
    </Card>
  )
}
