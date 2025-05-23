"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Components
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import Notifications from "./notifPanel";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useRouter } from "next/navigation";
import VaccineDashboard from "./VaccineDrillDown";
import VaccinationReportGenerator from "./VaccinationSummary";

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
  id?: string;
}

/** Merged Home Component **/
export default function Home() {
  // Get API functions from the protected routes hook
  const { getAdminDataDashBoard, vaccinePercentageRoutes } =
    useProtectedRoutesApi();
  const router = useRouter();

  /** FILTER STATES **/
  // Gender filter dropdown
  const [filterGender, setFilterGender] = useState("all");

  // Separate dropdown states for Baranggay and Purok
  const [filterBaranggay, setFilterBaranggay] = useState("all");
  const [filterPurok, setFilterPurok] = useState("all");

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
    // Baranggay filtering
    if (filterBaranggay !== "all") {
      const baranggay =
        infant.address && infant.address.baranggay
          ? infant.address.baranggay.toLowerCase()
          : "";
      if (baranggay !== filterBaranggay.toLowerCase()) return false;
    }
    // Purok filtering
    if (filterPurok !== "all") {
      const purok =
        infant.address && infant.address.purok
          ? infant.address.purok.toLowerCase()
          : "";
      if (purok !== filterPurok.toLowerCase()) return false;
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

  /** Unique Values for Baranggay **/
  const uniqueBaranggayValues = useMemo(() => {
    if (!adminData?.infants) return [];
    const values = new Set<string>();
    adminData.infants.forEach((infant: any) => {
      const value = infant.address?.baranggay;
      if (value) {
        values.add(value);
      }
    });
    return Array.from(values);
  }, [adminData]);

  /** Unique Purok Values based on selected Baranggay **/
  const uniquePurokValues = useMemo(() => {
    if (!adminData?.infants) return [];
    const values = new Set<string>();
    adminData.infants.forEach((infant: any) => {
      if (
        filterBaranggay === "all" ||
        (infant.address?.baranggay &&
          infant.address.baranggay.toLowerCase() ===
            filterBaranggay.toLowerCase())
      ) {
        const value = infant.address?.purok;
        if (value) {
          values.add(value);
        }
      }
    });
    return Array.from(values);
  }, [adminData, filterBaranggay]);

  /** Process filtered vaccine data for the bar chart **/
  const processVaccineStats = (): VaccineStat[] => {
    if (!filteredVaccineData) return [];

    const vaccineMap = new Map<string, VaccineStat>();

    filteredVaccineData.forEach((infant: any) => {
      infant.vaccinationSched?.forEach((vaccine: any) => {
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
      .map((infant: any) => ({
        id: infant.id, // Include infant ID
        name: infant?.fullname,
        percentage:
          infant?.vaccinationSched?.find(
            (v: any) => v.vaccineName === selectedVaccine
          )?.percentage || 0,
      }))
      .sort((a: any, b: any) => (b.percentage || 0) - (a.percentage || 0));
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;

    const handleClick = () => {
      if (payload && payload.id) {
        router.push(`/home/infant/details?id=${payload.id}`);
      }
    };

    return (
      <g onClick={handleClick} style={{ cursor: "pointer" }}>
        <circle cx={cx} cy={cy} r={5} fill="#004749" />
      </g>
    );
  };

  // Local state to track the selected vaccine for drill-down view
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);

  const vaccineStats = processVaccineStats();
  const individualData = processIndividualData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] min-h-screen bg-[#f4faff]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="p-4 sm:p-10 font-[family-name:var(--font-geist-sans)]">
        <div className="flex items-center space-x-4 hover:scale-105 transition-transform duration-200">
          <img
            src="/app-logo.jpeg"
            alt="Logo"
            className="h-12 w-12 object-cover rounded-lg shadow-lg ring-2 ring-white/20"
          />
          <div className="flex flex-col rounded-lg p-4 shadow-lg">
            <h1 className="text-4xl font-semibold bg-gradient-to-r from-[#93acff] to-[#8993ff] bg-clip-text text-transparent">
              InfantGuard
            </h1>
            <p className="text-sm font-medium text-gray-300 mt-[-2px]">
              undergrad thesis project
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full">
          {/* Filter Section Positioned at Top Right */}
          <div className="flex justify-end mb-8">
            <div
              className="p-4 rounded-xl shadow-md space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4"
              style={{
                backgroundColor: "#f4faff",
                borderLeft: "4px solid #8993ff",
              }}
            >
              {/* Gender Filter Dropdown */}
              <select
                className="p-2 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#dbedff", borderColor: "#8993ff" }}
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {/* Baranggay Filter Dropdown */}
              <select
                className="p-2 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#accbff", borderColor: "#8993ff" }}
                value={filterBaranggay}
                onChange={(e) => {
                  setFilterBaranggay(e.target.value);
                  setFilterPurok("all"); // Reset purok
                }}
              >
                <option value="all">All Baranggay</option>
                {uniqueBaranggayValues.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              {/* Purok Filter Dropdown */}
              {/* <select
                className="p-2 border rounded-lg w-full sm:w-auto focus:outline-none focus:ring-2"
                style={{ backgroundColor: "#93acff", borderColor: "#8993ff" }}
                value={filterPurok}
                onChange={(e) => setFilterPurok(e.target.value)}
              >
                <option value="all">All Purok</option>
                {uniquePurokValues.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select> */}
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
            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
              {/* Left Column: Vaccine Graph and Dashboard Data */}
              <div className="space-y-8">
                {/* Vaccine Graph Section */}

                <VaccineDashboard
                  filteredVaccineData={filteredVaccineData}
                  vaccineStats={vaccineStats}
                  individualData={individualData}
                  isLoadingAdmin={isLoadingAdmin}
                  isErrorAdmin={isErrorAdmin}
                  adminError={adminError}
                  isLoadingVaccine={isLoadingVaccine}
                  isErrorVaccine={isErrorVaccine}
                  vaccineError={vaccineError}
                  selectedVaccine={selectedVaccine}
                  setSelectedVaccine={setSelectedVaccine}
                />

                {/* Dashboard Data Section */}
                <div className="space-y-12">
                  {/* Overview Cards */}
                  <section className="bg-[#f4faff] shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#505050]">
                      Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-[#dbedff] rounded-lg text-center">
                        <h3 className="text-lg font-medium text-gray-600">
                          Total Parents
                        </h3>
                        <p className="text-4xl font-bold text-[#93acff] mt-2">
                          {adminData?.overview?.totalParents}
                        </p>
                      </div>
                      <div className="p-4 bg-[#dbedff] rounded-lg text-center">
                        <h3 className="text-lg font-medium text-gray-600">
                          Total Infants
                        </h3>
                        <p className="text-4xl font-bold text-[#93acff] mt-2">
                          {adminData?.overview?.totalInfants}
                        </p>
                      </div>
                      <div className="p-4 bg-[#dbedff] rounded-lg text-center">
                        <h3 className="text-lg font-medium text-gray-600">
                          Total Vaccinations
                        </h3>
                        <p className="text-4xl font-bold text-[#93acff] mt-2">
                          {adminData?.overview?.totalVaccinations}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Vaccination Summary */}
                  <section className="bg-[#f4faff] shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#5f5f5f]">
                      Vaccination Summary
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {adminData &&
                        adminData.vaccinationSummary &&
                        Object.entries(adminData.vaccinationSummary).map(
                          ([dose, summary]) => (
                            <div
                              key={dose}
                              className="p-4 bg-[#dbedff] rounded-lg"
                            >
                              <h3 className="text-lg font-medium capitalize mb-2">
                                {dose}
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
                    <VaccinationReportGenerator
                      vaccinationData={filteredVaccineData}
                    />
                  </section>

                  {/* Recent Parents */}
                  <section className="bg-[#dff0ff] shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#424242]">
                      Recent Parents
                    </h2>
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
                  <section className="bg-[#f4faff] shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 text-[#424242]">
                      Infants & Vaccination Schedules
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                      {filteredDashboardInfants.map((infant) => (
                        <div
                          key={infant?.id}
                          onClick={() =>
                            router.push(`/home/infant/details?id=${infant?.id}`)
                          }
                          className="flex flex-col md:flex-row items-center p-4 bg-[#dbedff] rounded-lg cursor-pointer hover:bg-[#accbff] transition-colors"
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
                                {infant.vaccinationSched?.map(
                                  (schedule, idx) => (
                                    <li
                                      key={idx}
                                      className="text-sm text-gray-700"
                                    >
                                      {schedule.vaccineName} -{" "}
                                      {schedule.percentage}% completed
                                    </li>
                                  )
                                )}
                              </ul>
                              <div className="mt-2 text-xs text-gray-500">
                                <p>
                                  <strong>Address:</strong>{" "}
                                  {infant.address?.purok},{" "}
                                  {infant.address?.baranggay}
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
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
