"use client";

import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import React from "react";

const VaccineManagement = () => {
  const developers = [
    {
      id: 1,
      image: "/student1.png",
      name: "John Kenneth Bajar",
      contact: "0991 324 4156",
      email: "bajar.johnkenneth@gmail.com",
      institution: "Bicol University Polangui",
      department: "Department of Computer Science",
      advisor: "Vince Angelo E. Naz",
      role: "Thesis Adviser",
    },
    {
      id: 2,
      image: "/student2.png",
      name: "Joemelson M. Carrascal",
      contact: "09461480729",
      email: "joemelson1234@gmail.com",
      institution: "Bicol University Polangui",
      department: "Department of Computer Science",
      advisor: "Vince Angelo E. Naz",
      role: "Thesis Adviser",
    },
    {
      id: 3,
      image: "/student3.png",
      name: "Jeslyn B. Malate",
      contact: "09673526479",
      email: "malatejeslyn@gmail.com",
      institution: "Bicol University Polangui",
      department: "Department of Computer Science",
      advisor: "Vince Angelo E. Naz",
      role: "Thesis Adviser",
    },
  ];

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      <Sidebar />

      <main className="p-8 sm:p-12 font-[family-name:var(--font-geist-sans)] flex flex-col">
        <div className="flex flex-col gap-8 max-w-4xl w-full mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              InfantGuard
            </h1>
            <p className="text-gray-600 text-lg">
              Bicol University Computer Science Capstone Project 2024
            </p>
          </div>

          {/* Project Info Section */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              About Our Capstone Project
            </h2>
            <p className="text-gray-700 mb-4">
              InfantGuard is an innovative immunization tracking system designed
              to modernize pediatric healthcare management. Our platform
              integrates advanced tracking technologies with user-friendly
              interfaces to ensure timely vaccinations and comprehensive health
              monitoring for infants.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-700">Key Features:</h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Digital immunization records</li>
                  <li>Vaccination schedule alerts</li>
                  <li>Health analytics dashboard</li>
                  <li>Multi-user access system</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-700">
                  Technologies Used:
                </h3>
                <ul className="list-disc list-inside text-gray-600">
                  <li>Next.js & React</li>
                  <li>Node.js & Express</li>
                  <li>Mysql</li>
                  <li>React Native</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Developers Section */}
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            Development Team
          </h2>
          {developers.map((developer) => (
            <div
              key={developer.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="md:w-1/3 flex justify-center">
                  <img
                    src={developer.image}
                    alt={developer.name}
                    className="w-48 h-48 object-cover rounded-full border-4 border-blue-100"
                  />
                </div>

                <div className="md:w-2/3 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {developer.name}
                  </h2>
                  <div className="flex gap-4 mb-4">
                    <a
                      href={`tel:${developer.contact}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      {developer.contact}
                    </a>
                    <a
                      href={`mailto:${developer.email}`}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      {developer.email}
                    </a>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-6 h-6 text-blue-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span className="font-semibold">
                        {developer.institution}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8">
                      {developer.department}
                    </p>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg
                        className="w-6 h-6 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="font-semibold">{developer.role}</span>
                    </div>
                    <p className="text-sm text-gray-600 pl-8">
                      {developer.advisor}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VaccineManagement;
