"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Dot } from "recharts"

interface PriceChartProps {
  data: Array<{ time: string; price: number }>
  lineBps: number
}

export function PriceChart({ data, lineBps }: PriceChartProps) {
  const lineValue = lineBps / 100
  const lastPrice = data[data.length - 1]?.price || 0

  const LastPriceDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload.time === data[data.length - 1]?.time) {
      return <Dot cx={cx} cy={cy} r={4} fill="#00D4FF" stroke="#0A0F1E" strokeWidth={2} />
    }
    return null
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" opacity={0.3} />
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            fontSize={12}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF" }}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9CA3AF" }}
          />
          <ReferenceLine
            y={lineValue}
            stroke="#00FFA3"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{
              value: `AI Line +${lineValue.toFixed(1)}%`,
              position: "topRight",
              fill: "#00FFA3",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00D4FF"
            strokeWidth={3}
            dot={<LastPriceDot />}
            activeDot={{ r: 6, fill: "#00D4FF", stroke: "#0A0F1E", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
