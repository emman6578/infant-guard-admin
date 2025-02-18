"use client";

import { createContext, PropsWithChildren, useContext } from "react";
import { API_URL } from "../Auth/config";
import { useAuth } from "@/context/AuthContextProvider";
import { Parent } from "@/app/home/parent/types";

interface ProtectedRoutesType {
  vaccinePercentageRoutes: () => Promise<unknown>;
  parentsList: () => Promise<unknown>;
  infantList: () => Promise<unknown>;
  deleteParent: (id: string) => Promise<unknown>;
  updateParent: (updatedParent: Parent) => Promise<unknown>;
  createInfant: (
    fullname: string,
    month: number,
    day: number,
    year: number,
    purok: string,
    baranggay: string,
    municipality: string,
    province: string,
    place_of_birth: string,
    height: number,
    gender: string,
    weight: number,
    mothers_name: string,
    fathers_name: string,
    contact_number: string,
    health_center: string,
    family_no: number
  ) => Promise<unknown>;
  UploadChildProfileImage: (id: string, imageFile: File) => Promise<unknown>;
  deleteInfants: (ids: string[]) => Promise<unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateInfant: (data: any, id: string) => Promise<unknown>;
  getOneInfantDetail: (id: string) => Promise<unknown>;
  updateVaccineStatus: (
    id: string,
    doseType: string,
    status: string
  ) => Promise<unknown>;
  getPushToken: (
    infant_id: string,
    title: string,
    body: string,
    data: string
  ) => Promise<unknown>;
  updatVaccineSchedDate: (
    vaccineSchedule_id: string,
    doseType: string,
    date: string
  ) => Promise<unknown>;
  getAdminDataDashBoard: () => Promise<unknown>;
  CreateVaccineSchedule: (id: string) => Promise<unknown>;
  CreateVaccineProgress: (id: string) => Promise<unknown>;
  infantDataDownload: () => Promise<unknown>;
  UploadDocumentToInfant: (id: string, pdfUri: File) => Promise<unknown>;
  downloadInfantVaccineProgress: (id: string) => Promise<unknown>;
}

const ProtectedRoutesContext = createContext<ProtectedRoutesType | undefined>(
  undefined
);

export const ProtectedRoutesContextProvider = ({
  children,
}: PropsWithChildren) => {
  //the authtoken is getting from auth context provider
  const { authToken } = useAuth();

  const vaccinePercentageRoutes = async () => {
    const res = await fetch(`${API_URL}/admin/percentage`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant details";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const parentsList = async () => {
    const res = await fetch(`${API_URL}/admin/parents`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant details";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const infantList = async () => {
    const res = await fetch(`${API_URL}/admin/infants`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant details";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const deleteParent = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/delete/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to delete parent";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateParent = async (updatedParent: any) => {
    const res = await fetch(`${API_URL}/admin/update/${updatedParent.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        fullname: updatedParent.fullname,
        contact_number: updatedParent.contact_number,
        address: updatedParent.address,
        auth: {
          email: updatedParent.auth.email,
        },
      }),
    });

    if (!res.ok) {
      let errorMessage = "Failed to update parent";
      const responseBody = await res.json();
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const createInfant = async (
    fullname: string,
    month: number,
    day: number,
    year: number,
    purok: string,
    baranggay: string,
    municipality: string,
    province: string,
    place_of_birth: string,
    height: number,
    gender: string,
    weight: number,
    mothers_name: string,
    fathers_name: string,
    contact_number: string,
    health_center: string,
    family_no: number
  ) => {
    const data = {
      fullname: fullname,
      birthday: {
        month: month,
        day: day,
        year: year,
      },
      address: {
        purok: purok,
        baranggay: baranggay,
        municipality: municipality,
        province: province,
      },
      place_of_birth: place_of_birth,
      height: height,
      gender: gender,
      weight: weight,
      mothers_name: mothers_name,
      fathers_name: fathers_name,
      contact_number: contact_number,
      health_center: health_center,
      family_no: family_no,
    };
    const res = await fetch(`${API_URL}/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Failed to create infant";
      const responseBody = await res.json();
      if (responseBody?.message) errorMessage = responseBody.message;
      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const UploadChildProfileImage = async (id: string, imageFile: File) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/parent/upload-img/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Note: Do not set 'Content-Type' header when sending FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const responseBody = await res.json();
        throw new Error(responseBody?.message);
      }

      return await res.json();
    } catch (error) {
      console.error("Error Updating Infant Image:", error);
      throw error;
    }
  };

  const deleteInfants = async (ids: string[]) => {
    const res = await fetch(`${API_URL}/admin/infants-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ids }), // Send IDs in request body
    });

    if (!res.ok) {
      let errorMessage = "Failed to delete infants";
      try {
        const responseBody = await res.json();
        if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }
      } catch (error) {
        console.error("Error parsing response:", error);
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateInfant = async (data: any, id: string) => {
    const res = await fetch(`${API_URL}/admin/infant-update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Failed to update parent";
      const responseBody = await res.json();
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const getOneInfantDetail = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/infant/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant detail";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const updateVaccineStatus = async (
    id: string,
    doseType: string,
    status: string
  ) => {
    const data = { id, doseType, status };

    console.log("Sending PUT request to update vaccine status:", data);

    const res = await fetch(`${API_URL}/admin/update-progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    console.log("Response Status:", res.status);

    if (!res.ok) {
      let errorMessage = "Failed to update vaccine status";
      const responseBody = await res.json();
      console.error("Error Response:", responseBody);

      if (responseBody && responseBody.error) {
        errorMessage = responseBody.error;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const getPushToken = async (
    infant_id: string,
    title: string,
    body: string,
    data: string
  ) => {
    const payload = {
      title: title,
      body: body,
      data: {
        received: data,
      },
    };

    const res = await fetch(`${API_URL}/admin/notify/${infant_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant push token";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const updatVaccineSchedDate = async (
    vaccineSchedule_id: string,
    doseType: string,
    date: string
  ) => {
    const data = { id: vaccineSchedule_id, doseType, date };

    const res = await fetch(`${API_URL}/admin/update-vaccine-schedule-date`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = "Failed to update vaccine date";
      const responseBody = await res.json();
      console.error("Error Response:", responseBody);

      if (responseBody && responseBody.error) {
        errorMessage = responseBody.error;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const getAdminDataDashBoard = async () => {
    const res = await fetch(`${API_URL}/admin/home-admin`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get admin dashboard data";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const CreateVaccineSchedule = async (id: string) => {
    const data = {
      infant_id: id,
    };

    try {
      const res = await fetch(`${API_URL}/parent/vaccine`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Check if response is not OK (status code not in range 200-299)
        let errorMessage = "Failed to create vaccine schedule";
        const responseBody = await res.json(); // Attempt to parse response body as JSON

        // Check if response body has an error message from the backend
        if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }

        throw new Error(errorMessage);
      }

      return await res.json();
    } catch (error) {
      console.error("Error Creating Vaccine Schedule:", error);
      throw error;
    }
  };

  const CreateVaccineProgress = async (id: string) => {
    const data = {
      infant_id: id,
    };

    try {
      const res = await fetch(`${API_URL}/parent/progress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Check if response is not OK (status code not in range 200-299)
        let errorMessage = "Failed to create vaccine progress";
        const responseBody = await res.json(); // Attempt to parse response body as JSON

        // Check if response body has an error message from the backend
        if (responseBody && responseBody.message) {
          errorMessage = responseBody.message;
        }

        throw new Error(errorMessage);
      }

      return await res.json();
    } catch (error) {
      console.error("Error Creating Vaccine Progress:", error);
      throw error;
    }
  };

  const infantDataDownload = async () => {
    const res = await fetch(`${API_URL}/admin/infant-data`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant data to download";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  const UploadDocumentToInfant = async (id: string, pdfFile: File) => {
    const formData = new FormData();
    // Use "pdf" as the key to match the server's expectation.
    formData.append("pdf", pdfFile);

    try {
      const res = await fetch(`${API_URL}/admin/upload-pdf/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          // Do not set 'Content-Type' header when sending FormData
        },
        body: formData,
      });

      if (!res.ok) {
        const responseBody = await res.json();
        throw new Error(responseBody?.message);
      }

      return await res.json();
    } catch (error) {
      console.error("Error Updating Infant Image:", error);
      throw error;
    }
  };

  const downloadInfantVaccineProgress = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/download/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!res.ok) {
      // Check if response is not OK (status code not in range 200-299)
      let errorMessage = "Failed to get infant detail";
      const responseBody = await res.json(); // Attempt to parse response body as JSON

      // Check if response body has an error message from the backend
      if (responseBody && responseBody.message) {
        errorMessage = responseBody.message;
      }

      throw new Error(errorMessage);
    }

    return await res.json();
  };

  return (
    <ProtectedRoutesContext.Provider
      value={{
        vaccinePercentageRoutes,
        parentsList,
        infantList,
        deleteParent,
        updateParent,
        createInfant,
        UploadChildProfileImage,
        deleteInfants,
        updateInfant,
        getOneInfantDetail,
        updateVaccineStatus,
        getPushToken,
        updatVaccineSchedDate,
        getAdminDataDashBoard,
        CreateVaccineSchedule,
        CreateVaccineProgress,
        infantDataDownload,
        UploadDocumentToInfant,
        downloadInfantVaccineProgress,
      }}
    >
      {children}
    </ProtectedRoutesContext.Provider>
  );
};

export const useProtectedRoutesApi = (): ProtectedRoutesType => {
  const context = useContext(ProtectedRoutesContext);
  if (context === undefined) {
    throw new Error("Getting error from ProtectedRoutes API");
  }
  return context;
};
