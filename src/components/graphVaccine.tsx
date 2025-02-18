"use client";

import React, { useState } from "react";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Infant } from "../app/home/page"; // Or from your shared types file

/** The API for vaccine percentages returns an object with a `data` property (an array of infants) */
interface VaccineGraphResponse {
  data: Infant[];
}

/** Type used for the aggregated stats per vaccine */
interface VaccineStat {
  vaccineName: string;
  sort: number;
  percentages: number[];
  min: number;
  max: number;
  avg: number;
}

/** Type for individual infant data for a selected vaccine */
interface IndividualData {
  name: string;
  percentage: number;
}

export default function VaccineGraph() {
  const { vaccinePercentageRoutes } = useProtectedRoutesApi();
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["percentage"],
    queryFn: vaccinePercentageRoutes,
  });

  // Process data for vaccine statistics
  const processVaccineStats = (): VaccineStat[] => {
    if (!data?.data) return [];

    const vaccineMap = new Map<string, VaccineStat>();

    data.data.forEach((infant) => {
      infant.vaccinationSched.forEach((vaccine) => {
        const key = vaccine.vaccineName;
        if (!vaccineMap.has(key)) {
          vaccineMap.set(key, {
            vaccineName: key,
            sort: parseInt(vaccine.sort),
            percentages: [],
            min: 100,
            max: 0,
            avg: 0,
          });
        }

        const entry = vaccineMap.get(key)!;
        entry.percentages.push(vaccine.percentage);
        entry.min = Math.min(entry.min, vaccine.percentage);
        entry.max = Math.max(entry.max, vaccine.percentage);
      });
    });

    // Calculate averages
    Array.from(vaccineMap.values()).forEach((vaccine) => {
      vaccine.avg =
        vaccine.percentages.reduce((a, b) => a + b, 0) /
        vaccine.percentages.length;
    });

    return Array.from(vaccineMap.values()).sort((a, b) => a.sort - b.sort);
  };

  // Process individual data for selected vaccine
  const processIndividualData = (): IndividualData[] => {
    if (!selectedVaccine || !data?.data) return [];

    return data.data
      .map((infant) => ({
        name: infant.fullname,
        percentage:
          infant.vaccinationSched.find((v) => v.vaccineName === selectedVaccine)
            ?.percentage || 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  if (isError) return <div>Error: {error?.message}</div>;
  if (isLoading) return <p>Loading...</p>;

  const vaccineStats = processVaccineStats();
  const individualData = processIndividualData();

  return (
    <div className="w-full space-y-8">
      {/* Summary Chart Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">
          Vaccination Coverage ({data.data.length} Infants)
        </h1>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vaccineStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="vaccineName"
                angle={-20}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="bg-white p-4 shadow-lg rounded-lg">
                      <p className="font-bold">
                        {payload[0].payload.vaccineName}
                      </p>
                      <p>Average: {payload[0].payload.avg.toFixed(1)}%</p>
                      <p>
                        Range: {payload[0].payload.min}% -{" "}
                        {payload[0].payload.max}%
                      </p>
                      <button
                        className="mt-2 text-blue-600 hover:underline"
                        onClick={() =>
                          setSelectedVaccine(payload[0].payload.vaccineName)
                        }
                      >
                        Show individual data →
                      </button>
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="avg"
                name="Average Coverage"
                fill="#8884d8"
                onClick={(data) => setSelectedVaccine(data.vaccineName)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual Vaccine Drill-Down Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">
          {selectedVaccine
            ? `${selectedVaccine} Coverage`
            : "Individual Vaccine Drill Down"}
        </h2>
        {selectedVaccine ? (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={individualData}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(value: number) => [`${value}%`, "Coverage"]}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#8884d8"
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-600 mt-2">
              Showing {individualData.length} infants, sorted by coverage
              percentage
            </p>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 rounded p-4">
            <p>
              Please select a vaccine from the chart above to see individual
              data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
