import React from "react";

interface VaccineName {
  id: string;
  vaccine_name: string;
  vaccine_type_code: string;
}

interface VaccineSchedule {
  id: string;
  firstDose?: string;
  secondDose?: string;
  thirdDose?: string;
  UpdateFirstDose?: string;
  UpdateSecondDose?: string;
  UpdateThirdDose?: string;
  vaccine_names?: VaccineName[];
}

interface InfantData {
  id: string;
  fullname: string;
  Vaccination_Schedule: VaccineSchedule[];
}

interface DoseTimingAnalysisProps {
  infantData: InfantData;
}

const DoseTimingAnalysis: React.FC<DoseTimingAnalysisProps> = ({
  infantData,
}) => {
  if (!infantData || !infantData.Vaccination_Schedule) {
    return <div>No vaccination data available for analysis.</div>;
  }

  const schedules = infantData.Vaccination_Schedule;

  let totalDoses = 0; // Only counts doses that have been administered
  let earlyCount = 0;
  let onTimeCount = 0;
  let lateCount = 0;
  const detailedResults: {
    vaccine: string;
    dose: string;
    scheduled: string;
    updated: string;
    difference: number | null;
    status: string;
  }[] = [];

  // Helper function to compute the difference in days between two dates.
  const dayDifference = (scheduled: string, updated: string): number => {
    const scheduledDate = new Date(scheduled);
    const updatedDate = new Date(updated);
    const diffTime = updatedDate.getTime() - scheduledDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return Math.round(diffDays);
  };

  // Helper function to analyze one dose.
  const analyzeDose = (
    doseName: string,
    scheduledDate?: string,
    updatedDate?: string,
    vaccineName?: string
  ) => {
    // Only analyze timing if the dose has been administered (both dates exist)
    if (scheduledDate && updatedDate) {
      totalDoses++;
      const diff = dayDifference(scheduledDate, updatedDate);
      let status = "";
      if (diff === 0) {
        status = "ON TIME";
        onTimeCount++;
      } else if (diff < 0) {
        status = `EARLY by ${Math.abs(diff)} day${
          Math.abs(diff) > 1 ? "s" : ""
        }`;
        earlyCount++;
      } else {
        status = `LATE by ${diff} day${diff > 1 ? "s" : ""}`;
        lateCount++;
      }
      detailedResults.push({
        vaccine: vaccineName || "Unknown Vaccine",
        dose: doseName,
        scheduled: scheduledDate,
        updated: updatedDate,
        difference: diff,
        status,
      });
    } else if (scheduledDate && !updatedDate) {
      // Optionally, if a dose is scheduled but not yet administered, add it as "pending"
      detailedResults.push({
        vaccine: vaccineName || "Unknown Vaccine",
        dose: doseName,
        scheduled: scheduledDate,
        updated: "Pending",
        difference: null,
        status: "PENDING",
      });
    }
  };

  // Process each vaccination schedule.
  schedules.forEach((schedule) => {
    const vaccineName =
      schedule.vaccine_names && schedule.vaccine_names.length > 0
        ? schedule.vaccine_names[0].vaccine_name
        : "Unknown Vaccine";

    analyzeDose(
      "First Dose",
      schedule.firstDose,
      schedule.UpdateFirstDose,
      vaccineName
    );
    analyzeDose(
      "Second Dose",
      schedule.secondDose,
      schedule.UpdateSecondDose,
      vaccineName
    );
    analyzeDose(
      "Third Dose",
      schedule.thirdDose,
      schedule.UpdateThirdDose,
      vaccineName
    );
  });

  // Calculate percentages using only doses that have been administered.
  const administeredDoses = onTimeCount + earlyCount + lateCount;
  const overallEarly =
    administeredDoses > 0
      ? ((earlyCount / administeredDoses) * 100).toFixed(1)
      : "0";
  const overallOnTime =
    administeredDoses > 0
      ? ((onTimeCount / administeredDoses) * 100).toFixed(1)
      : "0";
  const overallLate =
    administeredDoses > 0
      ? ((lateCount / administeredDoses) * 100).toFixed(1)
      : "0";

  // Build a mapping of unique vaccines along with their vaccine_type_code.
  const uniqueVaccinesMap: { [vaccineName: string]: string } = {};
  schedules.forEach((schedule) => {
    if (schedule.vaccine_names && schedule.vaccine_names[0]) {
      const vaccine = schedule.vaccine_names[0];
      uniqueVaccinesMap[vaccine.vaccine_name] = vaccine.vaccine_type_code;
    }
  });

  // Convert the mapping to an array of objects and sort by vaccine_type_code.
  const uniqueVaccinesArray = Object.keys(uniqueVaccinesMap).map(
    (vaccineName) => ({
      vaccine_name: vaccineName,
      vaccine_type_code: uniqueVaccinesMap[vaccineName],
    })
  );
  uniqueVaccinesArray.sort(
    (a, b) => parseInt(a.vaccine_type_code) - parseInt(b.vaccine_type_code)
  );

  // Mapping of vaccine names to potential effects if administered too early or too late.
  const vaccineEffects: {
    [key: string]: {
      early: string;
      late: string;
    };
  } = {
    "BGC Vaccine": {
      early:
        "Administering this vaccine too early may result in a suboptimal immune response as the infant's immune system might not be fully prepared, though slight deviations may be acceptable.",
      late: "If administered late, the infant may remain vulnerable to the targeted infection for a longer period.",
    },
    "Hepatitis B Vaccine": {
      early:
        "Administering the Hepatitis B vaccine too early might lead to interference from maternal antibodies, potentially reducing its effectiveness.",
      late: "A delay in administering the Hepatitis B vaccine could increase the risk of vertical transmission from mother to child.",
    },
    "Oral Polion Vaccine (OPV)": {
      early:
        "Early administration might not allow for optimal mucosal immunity if the infant's gut is not ready, and maternal antibodies may interfere with the response.",
      late: "Late administration could leave the infant unprotected for a longer period, increasing the risk of poliovirus exposure.",
    },
    "Pentavalent Vaccine (DPT-HEB B-HIB)": {
      early:
        "If given too early, there may be reduced immunogenicity, and the infant might not mount a strong immune response.",
      late: "Delayed administration could lead to a window of vulnerability to the diseases targeted by this vaccine.",
    },
    "Measles, Mumps, Rubella Vaccine (MMR)": {
      early:
        "Administering the MMR vaccine too early may result in interference from maternal antibodies, thereby reducing its effectiveness.",
      late: "Late vaccination might result in a prolonged period of susceptibility to measles, mumps, and rubella, which is especially concerning during outbreaks.",
    },
    "Pneumococcal Conjugate Vaccine (PCV)": {
      early:
        "Administering the vaccine too early might lead to a less effective immune response due to the immaturity of the infant's immune system.",
      late: "Delays in vaccination may leave the child at increased risk for pneumococcal infections, which can be serious in young infants.",
    },
    "Inactivated Polio Vaccine (IPV)": {
      early:
        "Early vaccination could potentially reduce the vaccine's efficacy if the infant's immune system hasn't matured enough, though it is generally safe.",
      late: "Delayed doses may result in prolonged vulnerability to poliovirus infection.",
    },
  };

  // Helper to fetch potential effects based on vaccine name.
  const getEffects = (vaccineName: string) => {
    return (
      vaccineEffects[vaccineName] || {
        early: "No specific data available for early administration.",
        late: "No specific data available for delayed administration.",
      }
    );
  };

  return (
    <div className="p-4 border rounded shadow bg-white my-4">
      <h2 className="text-2xl font-bold mb-4">
        Vaccination Dose Timing Analysis
      </h2>

      <div className="mb-4">
        <p>
          <strong>Total Administered Doses Analyzed:</strong>{" "}
          {administeredDoses}
        </p>
        <p>
          <strong>Early Doses:</strong> {earlyCount} ({overallEarly}%)
        </p>
        <p>
          <strong>On Time Doses:</strong> {onTimeCount} ({overallOnTime}%)
        </p>
        <p>
          <strong>Late Doses:</strong> {lateCount} ({overallLate}%)
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">
          Detailed Analysis per Dose:
        </h3>
        <ul>
          {detailedResults.map((result, index) => (
            <li key={index} className="mb-1">
              <span className="font-semibold">
                {result.vaccine} - {result.dose}:
              </span>{" "}
              Scheduled on{" "}
              {result.scheduled !== "Pending"
                ? new Date(result.scheduled).toLocaleDateString()
                : "Pending"}
              {result.updated !== "Pending"
                ? `, updated on ${new Date(
                    result.updated
                  ).toLocaleDateString()}`
                : " (Not yet administered)"}{" "}
              ({result.status}
              {result.difference !== null && result.status !== "PENDING"
                ? ` by ${Math.abs(result.difference)} day${
                    Math.abs(result.difference) !== 1 ? "s" : ""
                  }`
                : ""}
              )
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t pt-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">Predictive Analysis:</h3>
        <p>
          Based on current trends, a significant percentage of doses have been
          administered early. This proactive approach may shorten the window of
          vulnerability; however, if a vaccine is administered too early, the
          infant’s immune system may not generate an optimal response.
          Conversely, late vaccination increases the period during which the
          child is unprotected. Monitoring these patterns can help ensure that
          future doses are timed for maximum efficacy.
        </p>
      </div>

      <div className="border-t pt-4 mb-4">
        <h3 className="text-xl font-semibold mb-2">
          Potential Effects of Early or Late Vaccination:
        </h3>
        {uniqueVaccinesArray.map((vaccineObj, index) => {
          const effects = getEffects(vaccineObj.vaccine_name);
          return (
            <div key={index} className="mb-3">
              <h4 className="font-bold">{vaccineObj.vaccine_name}</h4>
              <p>
                <strong>If administered too early:</strong> {effects.early}
              </p>
              <p>
                <strong>If administered too late:</strong> {effects.late}
              </p>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">References:</h3>
        <ol className="list-decimal ml-5">
          <li>
            Centers for Disease Control and Prevention.{" "}
            <em>Timing and Spacing of Immunobiologics</em>.{" "}
            <a
              href="https://www.cdc.gov/vaccines/hcp/imz-best-practices/timing-spacing-immunobiologics.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://www.cdc.gov/vaccines/hcp/imz-best-practices/timing-spacing-immunobiologics.html
            </a>
          </li>
          <li>
            Clark, A., Sanderson, C.{" "}
            <em>
              Timing of children's vaccinations in 45 low-income and
              middle-income countries: an analysis of survey data
            </em>
            . The Lancet.{" "}
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/2526419/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://pubmed.ncbi.nlm.nih.gov/2526419/
            </a>
          </li>
          <li>
            Centers for Disease Control and Prevention.{" "}
            <em>
              General Best Practice Guidelines for Immunization: Timing and
              Spacing of Immunobiologics
            </em>
            .{" "}
            <a
              href="https://www.cdc.gov/vaccines/hcp/acip-recs/general-recs/timing.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://www.cdc.gov/vaccines/hcp/acip-recs/general-recs/timing.html
            </a>
          </li>
          <li>
            World Health Organization. <em>Poliomyelitis</em>.{" "}
            <a
              href="https://www.who.int/news-room/fact-sheets/detail/poliomyelitis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://www.who.int/news-room/fact-sheets/detail/poliomyelitis
            </a>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default DoseTimingAnalysis;
