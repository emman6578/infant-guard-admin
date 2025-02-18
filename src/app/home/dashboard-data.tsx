import React from "react";
import { DashboardDataResponse } from "./page"; // Or import from your shared types file

interface DashboardDataProps {
  data: DashboardDataResponse;
}

export default function DashboardData({ data }: DashboardDataProps) {
  if (!data) {
    return <div className="text-center p-8">Loading data...</div>;
  }

  const { overview, recentParents, infants, vaccinationSummary } = data;

  return (
    <div className="space-y-12">
      {/* Overview Cards */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600">Total Parents</h3>
            <p className="text-4xl font-bold text-blue-500 mt-2">
              {overview.totalParents}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600">Total Infants</h3>
            <p className="text-4xl font-bold text-green-500 mt-2">
              {overview.totalInfants}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600">
              Total Vaccinations
            </h3>
            <p className="text-4xl font-bold text-red-500 mt-2">
              {overview.totalVaccinations}
            </p>
          </div>
        </div>
      </section>

      {/* Vaccination Summary */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Vaccination Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(vaccinationSummary).map(([dose, summary]) => (
            <div key={dose} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium capitalize mb-2">
                {dose} Dose
              </h3>
              <ul className="space-y-1">
                <li>
                  <span className="font-medium">Done:</span> {summary.DONE}
                </li>
                <li>
                  <span className="font-medium">Ongoing:</span>{" "}
                  {summary.ONGOING}
                </li>
                <li>
                  <span className="font-medium">Not Done:</span>{" "}
                  {summary.NOT_DONE}
                </li>
              </ul>
            </div>
          ))}
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
              {recentParents.map((parent) => (
                <tr key={parent.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {parent.fullname}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {parent.role}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(parent.created).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {parent.lastLogin
                      ? new Date(parent.lastLogin).toLocaleDateString()
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
          {infants.map((infant) => (
            <div
              key={infant.id}
              className="flex flex-col md:flex-row items-center p-4 bg-gray-50 rounded-lg"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={infant.image}
                alt={infant.fullname}
                className="w-24 h-24 rounded-full object-cover mr-4"
              />
              <div className="w-full">
                <h3 className="text-xl font-medium text-gray-800">
                  {infant.fullname}
                </h3>
                <div className="mt-2">
                  <h4 className="text-lg font-semibold text-gray-600">
                    Vaccination Schedule:
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {infant.vaccinationSched.map((schedule) => (
                      <li key={schedule.sort} className="text-sm text-gray-700">
                        {schedule.vaccineName} - {schedule.percentage}%
                        completed
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
