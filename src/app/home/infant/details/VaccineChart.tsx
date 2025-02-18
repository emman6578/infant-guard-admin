// components/VaccineChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VaccineChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4">Vaccine Status Graph</h2>
      <div style={{ minWidth: "600px" }}>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 60, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="vaccine"
              tick={{ angle: -10, textAnchor: "end", fontSize: 12 }}
              interval={0}
            />
            <YAxis
              domain={[0, 100]}
              label={{
                value: "Percentage",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                fontSize: 14,
              }}
            />
            <Tooltip />
            <Bar dataKey="percentage" fill="#FF6B6B" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
