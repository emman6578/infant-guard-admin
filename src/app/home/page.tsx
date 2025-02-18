"use client";

import React, { useState, useMemo } from "react";
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

// Components
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Notifications from "./notifPanel";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";

/** DASHBOARD & VACCINE DATA TYPES **/

export interface Overview {
  totalParents?: number;
  totalInfants?: number;
  totalVaccinations?: number;
}

export interface Parent {
  id?: string;
  fullname?: string | null;
  created?: string;
  lastLogin?: string | null;
  role?: string;
}

/** Infant type now includes address and gender **/
export interface Infant {
  id?: string;
  fullname?: string | null;
  image?: string;
  address?: {
    id?: string;
    purok?: string;
    baranggay?: string;
    municipality?: string;
    province?: string;
    created?: string;
    updated?: string;
  };
  gender?: string;
  vaccinationSched?: VaccineSchedule[];
}

export interface VaccineSchedule {
  vaccineName?: string;
  percentage?: number;
  sort?: string;
}

export interface DoseSummary {
  DONE?: number;
  ONGOING?: number;
  NOT_DONE?: number;
}

export interface VaccinationSummary {
  [dose: string]: DoseSummary | undefined;
}

export interface NotificationType {
  id?: string;
  parentId?: string;
  title?: string;
  body?: string;
  data?: string;
  created?: string;
  updated?: string;
  parent?: {
    fullname?: string;
  };
}

export interface DashboardDataResponse {
  overview?: Overview;
  recentParents?: Parent[];
  infants?: Infant[];
  vaccinationSummary?: VaccinationSummary;
  notifications?: NotificationType[];
  message?: string;
}

/** Vaccine Graph Response (using the same Infant type) **/
interface VaccineGraphResponse {
  data?: Infant[];
}

/** Types for vaccine stats and individual infant data **/
interface VaccineStat {
  vaccineName?: string;
  sort?: number;
  percentages?: number[];
  min?: number;
  max?: number;
  avg?: number;
}

interface IndividualData {
  name?: string;
  percentage?: number;
}

/** Merged Home Component **/
export default function Home() {
  // Get API functions from the protected routes hook
  const { getAdminDataDashBoard, vaccinePercentageRoutes } =
    useProtectedRoutesApi();

  /** FILTER STATES **/
  // Gender filter dropdown
  const [filterGender, setFilterGender] = useState("all");

  // Address filter: choose the address field and then the value
  const [filterAddressField, setFilterAddressField] = useState("all");
  const [filterAddressValue, setFilterAddressValue] = useState("all");

  // Query for dashboard data
  const {
    data: adminData,
    isLoading: isLoadingAdmin,
    isError: isErrorAdmin,
    error: adminError,
  } = useQuery<DashboardDataResponse>({
    queryKey: ["admin"],
    queryFn: getAdminDataDashBoard,
  });

  // Query for vaccine percentages data
  const {
    data: vaccineData,
    isLoading: isLoadingVaccine,
    isError: isErrorVaccine,
    error: vaccineError,
  } = useQuery<VaccineGraphResponse>({
    queryKey: ["percentage"],
    queryFn: vaccinePercentageRoutes,
  });

  /** Filtering Logic **/
  const filterInfant = (infant: Infant) => {
    // Gender filtering
    if (filterGender !== "all" && infant.gender !== filterGender) return false;
    // Address filtering: if an address field and a value are selected,
    // only return infants whose address field exactly matches the value.
    if (filterAddressField !== "all" && filterAddressValue !== "all") {
      const fieldValue =
        infant.address &&
        infant.address[filterAddressField as keyof typeof infant.address];
      if (!fieldValue) return false;
      if (fieldValue.toLowerCase() !== filterAddressValue.toLowerCase())
        return false;
    }
    return true;
  };

  // Apply filtering on dashboard infants and vaccine data
  const filteredDashboardInfants = adminData?.infants
    ? adminData.infants.filter(filterInfant)
    : [];
  const filteredVaccineData = vaccineData?.data
    ? vaccineData.data.filter(filterInfant)
    : [];

  /** Unique Address Values for the selected field **/
  const uniqueAddressValues = useMemo(() => {
    if (filterAddressField === "all" || !adminData?.infants) return [];
    const values = new Set<string>();
    adminData.infants.forEach((infant) => {
      const value =
        infant.address &&
        infant.address[filterAddressField as keyof typeof infant.address];
      if (value) {
        values.add(value);
      }
    });
    return Array.from(values);
  }, [adminData, filterAddressField]);

  /** Process filtered vaccine data for the bar chart **/
  const processVaccineStats = (): VaccineStat[] => {
    if (!filteredVaccineData) return [];

    const vaccineMap = new Map<string, VaccineStat>();

    filteredVaccineData.forEach((infant) => {
      infant.vaccinationSched?.forEach((vaccine) => {
        const key = vaccine.vaccineName || "";
        if (!vaccineMap.has(key)) {
          vaccineMap.set(key, {
            vaccineName: key,
            sort: vaccine.sort ? parseInt(vaccine.sort) : 0,
            percentages: [],
            min: 100,
            max: 0,
            avg: 0,
          });
        }
        const entry = vaccineMap.get(key)!;
        entry.percentages?.push(vaccine.percentage || 0);
        entry.min = Math.min(entry.min || 100, vaccine.percentage || 0);
        entry.max = Math.max(entry.max || 0, vaccine.percentage || 0);
      });
    });

    // Calculate averages for each vaccine
    Array.from(vaccineMap.values()).forEach((vaccine) => {
      if (vaccine.percentages && vaccine.percentages.length > 0) {
        vaccine.avg =
          vaccine.percentages.reduce((a, b) => a + b, 0) /
          vaccine.percentages.length;
      }
    });

    return Array.from(vaccineMap.values()).sort((a, b) => {
      const sortA = a.sort || 0;
      const sortB = b.sort || 0;
      return sortA - sortB;
    });
  };

  /** Process individual data for a selected vaccine **/
  const processIndividualData = (): IndividualData[] => {
    if (!selectedVaccine || !filteredVaccineData) return [];

    return filteredVaccineData
      .map((infant) => ({
        name: infant?.fullname,
        percentage:
          infant?.vaccinationSched?.find(
            (v) => v.vaccineName === selectedVaccine
          )?.percentage || 0,
      }))
      .sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
  };

  // Local state to track the selected vaccine for drill-down view
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);

  const vaccineStats = processVaccineStats();
  const individualData = processIndividualData();

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen bg-[#026167]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        {/* Filter Section Positioned at Top Right */}
        <div className="flex justify-end mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Gender Filter Dropdown */}
            <select
              className="p-2 border rounded w-full sm:w-auto"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Address Field Filter Dropdown */}
            <select
              className="p-2 border rounded w-full sm:w-auto"
              value={filterAddressField}
              onChange={(e) => {
                setFilterAddressField(e.target.value);
                setFilterAddressValue("all"); // Reset value when field changes
              }}
            >
              <option value="all">All Addresses</option>
              <option value="purok">Purok</option>
              <option value="baranggay">Baranggay</option>
              <option value="municipality">Municipality</option>
              <option value="province">Province</option>
            </select>

            {/* Address Value Dropdown (conditional) */}
            {filterAddressField !== "all" && (
              <select
                className="p-2 border rounded w-full sm:w-auto"
                value={filterAddressValue}
                onChange={(e) => setFilterAddressValue(e.target.value)}
              >
                <option value="all">All</option>
                {uniqueAddressValues.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {isLoadingAdmin ? (
          <div className="flex items-center justify-center bg-white shadow rounded-lg p-6">
            Loading dashboard data...
          </div>
        ) : isErrorAdmin ? (
          <div className="flex items-center justify-center bg-white shadow rounded-lg p-6 text-red-500">
            Error: {adminError?.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[70%_30%] gap-8">
            {/* Left Column: Vaccine Graph and Dashboard Data */}
            <div className="space-y-8">
              {/* Vaccine Graph Section */}
              <div className="w-full space-y-8">
                {/* Summary Chart Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h1 className="text-2xl font-bold mb-4">
                    Vaccination Coverage{" "}
                    {filteredVaccineData
                      ? `(${filteredVaccineData.length} Infants)`
                      : ""}
                  </h1>
                  {isLoadingVaccine ? (
                    <p>Loading vaccine graph data...</p>
                  ) : isErrorVaccine ? (
                    <p className="text-red-500">
                      Error: {vaccineError?.message}
                    </p>
                  ) : (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={vaccineStats}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 80,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="vaccineName"
                            angle={-20}
                            textAnchor="end"
                            interval={0}
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip
                            content={({ active, payload }) =>
                              active && payload && payload.length ? (
                                <div className="bg-white p-4 shadow-lg rounded-lg">
                                  <p className="font-bold">
                                    {payload[0].payload.vaccineName}
                                  </p>
                                  <p>
                                    Average:{" "}
                                    {payload[0].payload.avg?.toFixed(1)}%
                                  </p>
                                  <p>
                                    Range: {payload[0].payload.min}% -{" "}
                                    {payload[0].payload.max}%
                                  </p>
                                  <button
                                    className="mt-2 text-blue-600 hover:underline"
                                    onClick={() =>
                                      setSelectedVaccine(
                                        payload[0].payload.vaccineName
                                      )
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
                            fill="#004749"
                            onClick={(data) =>
                              setSelectedVaccine(data.vaccineName)
                            }
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
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
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 80,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" hide />
                          <YAxis
                            domain={[0, 100]}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <Tooltip
                            formatter={(value: number) => [
                              `${value}%`,
                              "Coverage",
                            ]}
                          />
                          <Line
                            type="monotone"
                            dataKey="percentage"
                            stroke="#004749"
                            dot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-sm text-gray-600 mt-2">
                        Showing {individualData.length} infants, sorted by
                        coverage percentage
                      </p>
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center border border-dashed border-gray-300 rounded p-4">
                      <p>
                        Please select a vaccine from the chart above to see
                        individual data.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dashboard Data Section */}
              <div className="space-y-12">
                {/* Overview Cards */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <h3 className="text-lg font-medium text-gray-600">
                        Total Parents
                      </h3>
                      <p className="text-4xl font-bold text-blue-500 mt-2">
                        {adminData?.overview?.totalParents}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <h3 className="text-lg font-medium text-gray-600">
                        Total Infants
                      </h3>
                      <p className="text-4xl font-bold text-green-500 mt-2">
                        {adminData?.overview?.totalInfants}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <h3 className="text-lg font-medium text-gray-600">
                        Total Vaccinations
                      </h3>
                      <p className="text-4xl font-bold text-red-500 mt-2">
                        {adminData?.overview?.totalVaccinations}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Vaccination Summary */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Vaccination Summary
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {adminData &&
                      adminData.vaccinationSummary &&
                      Object.entries(adminData.vaccinationSummary).map(
                        ([dose, summary]) => (
                          <div key={dose} className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-medium capitalize mb-2">
                              {dose} Dose
                            </h3>
                            <ul className="space-y-1">
                              <li>
                                <span className="font-medium">Done:</span>{" "}
                                {summary?.DONE}
                              </li>
                              <li>
                                <span className="font-medium">Ongoing:</span>{" "}
                                {summary?.ONGOING}
                              </li>
                              <li>
                                <span className="font-medium">Not Done:</span>{" "}
                                {summary?.NOT_DONE}
                              </li>
                            </ul>
                          </div>
                        )
                      )}
                  </div>
                </section>

                {/* Recent Parents */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">Recent Parents</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Full Name
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Role
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Created
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Last Login
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminData &&
                          adminData.recentParents?.map((parent) => (
                            <tr key={parent?.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {parent?.fullname}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {parent?.role}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {parent?.created
                                  ? new Date(
                                      parent.created
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {parent?.lastLogin
                                  ? new Date(
                                      parent.lastLogin
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Infants and Vaccination Schedules */}
                <section className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    Infants & Vaccination Schedules
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {filteredDashboardInfants.map((infant) => (
                      <div
                        key={infant?.id}
                        className="flex flex-col md:flex-row items-center p-4 bg-gray-50 rounded-lg"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={infant?.image}
                          alt={infant?.fullname || "Infant"}
                          className="w-24 h-24 rounded-full object-cover mr-4"
                        />
                        <div className="w-full">
                          <h3 className="text-xl font-medium text-gray-800">
                            {infant?.fullname}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {infant?.gender}
                          </p>
                          <div className="mt-2">
                            <h4 className="text-lg font-semibold text-gray-600">
                              Vaccination Schedule:
                            </h4>
                            <ul className="mt-1 space-y-1">
                              {infant.vaccinationSched?.map((schedule, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  {schedule.vaccineName} - {schedule.percentage}
                                  % completed
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 text-xs text-gray-500">
                              <p>
                                <strong>Address:</strong>{" "}
                                {infant.address?.purok},{" "}
                                {infant.address?.baranggay},{" "}
                                {infant.address?.municipality},{" "}
                                {infant.address?.province}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Right Column: Notifications Panel */}
            <div>
              <Notifications notifications={adminData?.notifications} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
