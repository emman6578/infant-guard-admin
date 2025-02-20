import React from "react";

type InfantData = {
  fullname: string;
  Vaccination_Schedule: any[];
  // … add more types as needed
};

function getDoseCompliance(
  scheduledDateStr: string,
  updatedDateStr: string
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const scheduledDate = new Date(scheduledDateStr);
  const updatedDate = new Date(updatedDateStr);
  const diffDays =
    Math.abs(updatedDate.getTime() - scheduledDate.getTime()) / msPerDay;

  if (diffDays === 0) return 100;
  if (diffDays <= 3) return 95;
  if (diffDays <= 7) return 90;
  if (diffDays <= 14) return 80;
  if (diffDays <= 30) return 70;
  return 50;
}

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
  // 1. Recalculate Compliance Using Updated Dose Dates
  // ------------------------------
  const recalculatedCompliances: number[] = [];
  let highComplianceCount = 0;
  let moderateComplianceCount = 0;
  let lowComplianceCount = 0;

  // ------------------------------
  // 2. Timeliness Score Variables (retain existing logic for now)
  // ------------------------------
  let totalTimelinessScore = 0;
  let timelinessRemarkCount = 0;
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

  schedules.forEach((schedule) => {
    // Calculate compliance for each expected dose using scheduled and updated dates.
    // We assume if a scheduled date exists, then an updated date should be compared.
    const doseScores: number[] = [];
    if (schedule.firstDose && schedule.UpdateFirstDose) {
      doseScores.push(
        getDoseCompliance(schedule.firstDose, schedule.UpdateFirstDose)
      );
    }
    if (schedule.secondDose && schedule.UpdateSecondDose) {
      doseScores.push(
        getDoseCompliance(schedule.secondDose, schedule.UpdateSecondDose)
      );
    }
    if (schedule.thirdDose && schedule.UpdateThirdDose) {
      doseScores.push(
        getDoseCompliance(schedule.thirdDose, schedule.UpdateThirdDose)
      );
    }
    // Average the score for the schedule
    const scheduleCompliance =
      doseScores.length > 0
        ? doseScores.reduce((a, b) => a + b, 0) / doseScores.length
        : 0;
    recalculatedCompliances.push(scheduleCompliance);

    // Count compliance categories
    if (scheduleCompliance >= 80) {
      highComplianceCount++;
    } else if (scheduleCompliance >= 50) {
      moderateComplianceCount++;
    } else {
      lowComplianceCount++;
    }

    // Process timeliness remarks (if available)
    ["remark_FirstDose", "remark_SecondDose", "remark_ThirdDose"].forEach(
      (key) => {
        const remark = schedule[key];
        if (remark) {
          totalTimelinessScore += scoreRemark(remark);
          timelinessRemarkCount++;
        }
      }
    );

    // Expected doses based on vaccine frequency from the first vaccine_names object
    const expectedDoses = Number(schedule.vaccine_names?.[0]?.frequency) || 0;
    totalExpectedDoses += expectedDoses;

    // Calculate completed doses using the Vaccination record
    let completed = 0;
    const vaccinationRecord = schedule.Vaccination?.[0];
    if (vaccinationRecord) {
      if (expectedDoses >= 1 && vaccinationRecord.firstDoseStatus === "DONE") {
        completed++;
      }
      if (expectedDoses >= 2 && vaccinationRecord.secondDoseStatus === "DONE") {
        completed++;
      }
      if (expectedDoses >= 3 && vaccinationRecord.thirdDoseStatus === "DONE") {
        completed++;
      }
    }
    totalCompletedDoses += completed;
  });

  // Compute overall average recalculated compliance
  const totalCompliance = recalculatedCompliances.reduce(
    (acc, curr) => acc + curr,
    0
  );
  const averageCompliance = totalCompliance / recalculatedCompliances.length;

  // Compute standard deviation for compliance percentages
  const variance =
    recalculatedCompliances.reduce(
      (acc, curr) => acc + Math.pow(curr - averageCompliance, 2),
      0
    ) / recalculatedCompliances.length;
  const stdDeviation = Math.sqrt(variance);

  // Compute average timeliness score
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
