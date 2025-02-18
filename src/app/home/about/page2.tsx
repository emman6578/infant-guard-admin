import React from "react";

// Updated data: added a oneYear property for each vaccine
const vaccineSchedule = [
  {
    vaccine: "BCG Vaccine",
    disease: "Tuberculosis",
    atBirth: true,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Hepatitis B Vaccine",
    disease: "Hepatitis B",
    atBirth: true,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Pentavalent Vaccine",
    disease: "Diphtheria, Tetanus, Pertussis, Hib, Hep B",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Oral Polio Vaccine (OPV)",
    disease: "Polio",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Inactivated Polio Vaccine (IPV)",
    disease: "Polio",
    atBirth: false,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Pneumococcal Vaccine (PCV)",
    disease: "Pneumonia, meningitis, sepsis",
    atBirth: false,
    sixWeeks: true,
    tenWeeks: true,
    fourteenWeeks: true,
    nineMonths: false,
    oneYear: false,
  },
  {
    vaccine: "Measles, Mumps, Rubella (MMR)",
    disease: "Measles, mumps, rubella",
    atBirth: false,
    sixWeeks: false,
    tenWeeks: false,
    fourteenWeeks: false,
    nineMonths: true,
    oneYear: true,
  },
];

const VaccinePage2 = () => {
  return (
    <div
      className="bg-cover bg-center min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/bg_image_form2.png')" }}
    >
      <div className="w-full text-center">
        <h2 className="text-4xl font-bold mb-4 text-white text-left ml-10">
          Schedule ng pagbibigay ng bakuna <br /> para sa mga batang isang taon
          pababa
        </h2>

        {/* Table container at 100% width */}
        <div
          className="overflow-x-auto p-4 rounded shadow-lg mx-auto"
          style={{ width: "90%" }}
        >
          <table className="min-w-full text-sm border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-left">
                  Bakuna
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-left">
                  Sakit na Maiiwasan
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  At Birth
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  6 Weeks / 1.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  10 Weeks / 2.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  14 Weeks / 3.5 mos
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  9 Months
                </th>
                <th className="border border-black px-2 py-1 bg-[#ffbd5f] text-black text-center">
                  12 Months / 1 Year
                </th>
              </tr>
            </thead>
            <tbody>
              {vaccineSchedule.map((item) => (
                <tr key={item.vaccine}>
                  <td className="border border-black px-2 py-1 bg-white text-black text-left">
                    {item.vaccine}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-left">
                    {item.disease}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.atBirth ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.sixWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.tenWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.fourteenWeeks ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.nineMonths ? "✔" : ""}
                  </td>
                  <td className="border border-black px-2 py-1 bg-white text-black text-center">
                    {item.oneYear ? "✔" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer: Mga paalala at 100% width */}
        <div
          className="mt-4 space-y-2 bg-white p-4 rounded shadow-lg mx-auto"
          style={{ width: "90%" }}
        >
          <h3 className="font-semibold text-center">Mga paalala:</h3>
          <ul className="list-disc ml-6 text-left">
            <li>
              Magsimula nang pagpapabakuna sa tamang edad at oras. Maari ring
              gawin ang bilang puwang kung kailangan ng bakuna.
            </li>
            <li>
              Sundin ang schedule ng pagbabakuna. Huwag magpatumpik-tumpik;
              importanteng protektahan ang bata mula sa mga sakit.
            </li>
            <li>
              Siguruhing updated ang pagbabakuna ng bata sa lahat ng recommended
              vaccines.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VaccinePage2;
