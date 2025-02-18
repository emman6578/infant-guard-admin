// PredictiveAnalysis.tsx
import React from "react";

type InfantData = {
  fullname: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Vaccination_Schedule: any[];
  // … add more types as needed
};

export default function PredictiveAnalysis({
  infantData,
}: {
  infantData: InfantData;
}) {
  const schedules = infantData?.Vaccination_Schedule;
  if (!schedules || schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Predictive Analysis</h2>
        <p>No vaccination schedule available for prediction.</p>
      </div>
    );
  }

  // ------------------------------
  // 1. Compliance Analysis Variables
  // ------------------------------
  const compliances: number[] = [];
  let highComplianceCount = 0;
  let moderateComplianceCount = 0;
  let lowComplianceCount = 0;

  // ------------------------------
  // 2. Timeliness Score Variables
  // ------------------------------
  let totalTimelinessScore = 0;
  let timelinessRemarkCount = 0;
  // helper function to score the remarks
  const scoreRemark = (remark: string | null): number => {
    if (remark === "ON_TIME") return 1;
    if (remark === "EARLY") return -0.5;
    if (remark === "LATE") return -1;
    return 0;
  };

  // ------------------------------
  // 3. Vaccination Completion Variables
  // ------------------------------
  let totalExpectedDoses = 0;
  let totalCompletedDoses = 0;

  // Loop over each schedule
  schedules.forEach((schedule) => {
    // Get the compliance percentage from the first Vaccination record (if available)
    const vaccinationRecord = schedule.Vaccination?.[0];
    const compliance = vaccinationRecord?.percentage;
    if (typeof compliance === "number") {
      compliances.push(compliance);
      if (compliance >= 80) {
        highComplianceCount++;
      } else if (compliance >= 50) {
        moderateComplianceCount++;
      } else {
        lowComplianceCount++;
      }
    }

    // Calculate timeliness score using the remarks on each dose from the schedule itself
    // (if a remark is missing, we ignore it)
    ["remark_FirstDose", "remark_SecondDose", "remark_ThirdDose"].forEach(
      (key) => {
        const remark = schedule[key];
        if (remark) {
          totalTimelinessScore += scoreRemark(remark);
          timelinessRemarkCount++;
        }
      }
    );

    // Calculate expected doses based on the vaccine's frequency.
    // (Assuming the first vaccine name object contains a 'frequency' property)
    const expectedDoses = Number(schedule.vaccine_names?.[0]?.frequency) || 0;
    totalExpectedDoses += expectedDoses;

    // Calculate completed doses by checking each dose status in the vaccination record.
    let completed = 0;
    if (vaccinationRecord) {
      // Only count the doses that exist; sometimes a vaccine may only require 1 or 2 doses.
      if (
        schedule.vaccine_names?.[0]?.frequency >= 1 &&
        vaccinationRecord.firstDoseStatus === "DONE"
      ) {
        completed++;
      }
      if (
        schedule.vaccine_names?.[0]?.frequency >= 2 &&
        vaccinationRecord.secondDoseStatus === "DONE"
      ) {
        completed++;
      }
      if (
        schedule.vaccine_names?.[0]?.frequency >= 3 &&
        vaccinationRecord.thirdDoseStatus === "DONE"
      ) {
        completed++;
      }
    }
    totalCompletedDoses += completed;
  });

  // Compute average compliance
  const totalCompliance = compliances.reduce((acc, curr) => acc + curr, 0);
  const averageCompliance = totalCompliance / compliances.length;

  // Compute standard deviation for compliance percentages
  const variance =
    compliances.reduce(
      (acc, curr) => acc + Math.pow(curr - averageCompliance, 2),
      0
    ) / compliances.length;
  const stdDeviation = Math.sqrt(variance);

  // Compute average timeliness score (if there are any remarks)
  const averageTimelinessScore =
    timelinessRemarkCount > 0
      ? totalTimelinessScore / timelinessRemarkCount
      : 0;

  // Compute overall vaccination completion rate
  const vaccinationCompletionRate =
    totalExpectedDoses > 0
      ? (totalCompletedDoses / totalExpectedDoses) * 100
      : 0;

  // ------------------------------
  // 4. Building the Predictive Outcome Message
  // ------------------------------
  let predictedOutcome = "";

  // For example, we might combine our variables into a prediction:
  if (averageCompliance >= 90 && vaccinationCompletionRate === 100) {
    predictedOutcome =
      "Excellent: The infant has maintained exceptional compliance with all vaccinations. Every dose has been completed on time with a perfect vaccination completion rate.";
  } else if (
    averageCompliance >= 80 &&
    vaccinationCompletionRate >= 90 &&
    averageTimelinessScore >= 0
  ) {
    predictedOutcome =
      "High: The overall compliance is strong and most doses are completed on schedule. There is minor room for improvement in timeliness.";
  } else if (averageCompliance >= 70 || moderateComplianceCount > 0) {
    predictedOutcome =
      "Moderate: The infant has a moderate likelihood of completing the vaccination schedule on time. Some doses may be at risk of delay, and targeted follow-ups are recommended.";
  } else if (averageCompliance >= 50) {
    predictedOutcome =
      "Low-Moderate: There are concerns with the vaccination progress. Although some doses are completed, the lower average compliance and incomplete doses suggest that more proactive reminders and support are needed.";
  } else {
    predictedOutcome =
      "Low: The vaccination compliance is poor. A significant number of doses are either incomplete or delayed, indicating that immediate intervention is required.";
  }

  // Adjust the outcome based on the variability of compliance and timeliness
  if (stdDeviation > 20) {
    predictedOutcome +=
      " However, there is significant variability in the compliance percentages, which may indicate inconsistencies between different vaccines.";
  }
  if (averageTimelinessScore < 0) {
    predictedOutcome +=
      " Additionally, the timeliness score suggests that vaccines are often administered earlier or later than scheduled.";
  }
  if (vaccinationCompletionRate < 90) {
    predictedOutcome +=
      " The overall completion rate is below optimal levels, highlighting potential gaps in the vaccination schedule.";
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Predictive Analysis</h2>
      <p className="mb-4">
        <span className="font-semibold">Average Vaccination Compliance:</span>{" "}
        {averageCompliance.toFixed(2)}%
      </p>
      <p className="mb-4">
        <span className="font-semibold">Standard Deviation:</span>{" "}
        {stdDeviation.toFixed(2)}
      </p>
      <p className="mb-4">
        <span className="font-semibold">High Compliance (≥80%):</span>{" "}
        {highComplianceCount}
      </p>
      <p className="mb-4">
        <span className="font-semibold">Moderate Compliance (50%-79%):</span>{" "}
        {moderateComplianceCount}
      </p>
      <p className="mb-4">
        <span className="font-semibold">Low Compliance (&lt;50%):</span>{" "}
        {lowComplianceCount}
      </p>
      <p className="mb-4">
        <span className="font-semibold">Average Timeliness Score:</span>{" "}
        {averageTimelinessScore.toFixed(2)}
      </p>
      <p className="mb-4">
        <span className="font-semibold">Vaccination Completion Rate:</span>{" "}
        {vaccinationCompletionRate.toFixed(2)}%
      </p>
      <p>{predictedOutcome}</p>
    </div>
  );
}
