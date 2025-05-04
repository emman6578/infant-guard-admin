"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { ParentTable } from "./ParentTable";
import { SearchBar } from "./SearchBar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { Parent } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParentList } from "./ParentList";

// Color palette
const COLORS = {
  lightBg: "#f4faff",
  mediumBg: "#dbedff",
  accentLight: "#accbff",
  accentMedium: "#93acff",
  accentDark: "#8993ff",
  text: "#333333", // Dark gray for text
};

// BaranggayFilter component
interface BaranggayFilterProps {
  baranggays: string[];
  selectedBaranggay: string;
  onBaranggayChange: (value: string) => void;
}

const BaranggayFilter = ({
  baranggays,
  selectedBaranggay,
  onBaranggayChange,
}: BaranggayFilterProps) => (
  <Select value={selectedBaranggay} onValueChange={onBaranggayChange}>
    <SelectTrigger className="w-[180px] bg-white border-2 border-[#accbff] text-[#333333]">
      <SelectValue placeholder="Filter by Baranggay" />
    </SelectTrigger>
    <SelectContent className="bg-[#f4faff] border-[#8993ff]">
      <SelectItem value="all" className="hover:bg-[#dbedff]">
        All Baranggays
      </SelectItem>
      {baranggays.map((baranggay) => (
        <SelectItem
          key={baranggay}
          value={baranggay}
          className="hover:bg-[#dbedff]"
        >
          {baranggay}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

// PurokFilter component
interface PurokFilterProps {
  puroks: string[];
  selectedPurok: string;
  onPurokChange: (value: string) => void;
}

const PurokFilter = ({
  puroks,
  selectedPurok,
  onPurokChange,
}: PurokFilterProps) => (
  <Select value={selectedPurok} onValueChange={onPurokChange}>
    <SelectTrigger className="w-[180px] bg-white border-2 border-[#accbff] text-[#333333]">
      <SelectValue placeholder="Filter by Purok" />
    </SelectTrigger>
    <SelectContent className="bg-[#f4faff] border-[#8993ff]">
      <SelectItem value="all" className="hover:bg-[#dbedff]">
        All Puroks
      </SelectItem>
      {puroks.map((purok) => (
        <SelectItem key={purok} value={purok} className="hover:bg-[#dbedff]">
          {purok}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ParentManagement = () => {
  const queryClient = useQueryClient();
  const { parentsList, updateParent, deleteParent } = useProtectedRoutesApi();
  const [editableData, setEditableData] = useState<{ [key: string]: Parent }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBaranggay, setSelectedBaranggay] = useState("all");
  const [selectedPurok, setSelectedPurok] = useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["parents"],
    queryFn: parentsList,
  });

  const updateMutation = useMutation({
    mutationFn: (updatedParent: Parent) => updateParent(updatedParent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (parentId: string) => deleteParent(parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] });
    },
  });

  // Reset purok selection when baranggay changes.
  useEffect(() => {
    setSelectedPurok("all");
  }, [selectedBaranggay]);

  // Helper to get unique baranggays from the data (filtering out undefined)
  const getUniqueBaranggays = (parents: Parent[]) => {
    const baranggays = new Set(
      parents
        .map((parent) => parent?.address?.baranggay)
        .filter((b): b is string => !!b)
    );
    return Array.from(baranggays).sort();
  };

  // Helper to get unique puroks only from parents within the selected baranggay.
  const getUniquePuroks = (parents: Parent[]) => {
    // Filter parents by selected baranggay if one is chosen
    const filteredParents =
      selectedBaranggay !== "all"
        ? parents.filter(
            (parent) => parent?.address?.baranggay === selectedBaranggay
          )
        : parents;
    const puroks = new Set(
      filteredParents
        .map((parent) => parent?.address?.purok)
        .filter((p): p is string => !!p)
    );
    return Array.from(puroks).sort();
  };

  // Filter parents based on name, baranggay and purok selections.
  const filteredParents = (
    data?.data?.filter((parent: Parent) => {
      const matchesName = parent.fullname
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const matchesBaranggay =
        selectedBaranggay === "all" ||
        parent?.address?.baranggay === selectedBaranggay;
      const matchesPurok =
        selectedPurok === "all" || parent?.address?.purok === selectedPurok;
      return matchesName && matchesBaranggay && matchesPurok;
    }) || []
  ).sort((a, b) => {
    // Helper to get surname (last word) and first name (remaining words)
    const getSortableNames = (fullname: string) => {
      const parts = fullname.trim().split(/\s+/);
      return {
        surname: parts[parts.length - 1] || "",
        firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
      };
    };

    const aNames = getSortableNames(a.fullname);
    const bNames = getSortableNames(b.fullname);

    // Compare surnames first
    const surnameCompare = aNames.surname.localeCompare(bNames.surname);
    if (surnameCompare !== 0) return surnameCompare;

    // If surnames match, compare first names
    return aNames.firstName.localeCompare(bNames.firstName);
  });

  const handleEdit = (parent: Parent) => {
    setEditableData((prev) => ({
      ...prev,
      [parent.id]: { ...parent },
    }));
  };

  const handleSave = async (parentId: string) => {
    const updatedParent = editableData[parentId];
    if (updatedParent) {
      try {
        // Remove the existing id from updatedParent
        const { id: _, ...parentData } = updatedParent;
        await updateMutation.mutateAsync({
          id: parentId,
          ...parentData,
          auth: {
            id: updatedParent.auth!.id,
            email: updatedParent.auth.email,
          },
          address: {
            id: updatedParent.address!.id,
            ...updatedParent.address,
          },
        });

        setEditableData((prev) => {
          const newState = { ...prev };
          delete newState[parentId];
          return newState;
        });
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
  };

  const handleDelete = (parentId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this parent? This will also delete the corresponding infant's details."
      )
    ) {
      deleteMutation.mutate(parentId);
    }
  };

  const handleChange = (parentId: string, field: string, value: string) => {
    setEditableData((prev) => {
      const currentParent = prev[parentId] ? { ...prev[parentId] } : {};
      const fields = field.split(".");

      let currentLevel: any = currentParent;
      for (let i = 0; i < fields.length - 1; i++) {
        const key = fields[i];
        if (!currentLevel[key]) currentLevel[key] = {};
        currentLevel = currentLevel[key];
      }

      const lastKey = fields[fields.length - 1];
      currentLevel[lastKey] = value;

      return {
        ...prev,
        [parentId]: currentParent,
      };
    });
  };

  const handleAddressChange = (
    parentId: string,
    field: string,
    value: string
  ) => {
    setEditableData((prev) => ({
      ...prev,
      [parentId]: {
        ...prev[parentId],
        address: {
          ...prev[parentId]?.address,
          [field]: value,
        },
      },
    }));
  };

  const handleCancel = (parentId: string) => {
    setEditableData((prev) => {
      const newState = { ...prev };
      delete newState[parentId];
      return newState;
    });
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4faff]">
        <div className="text-[#333333] text-xl font-semibold">
          Loading parents data...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-screen bg-[#f4faff]">
        <div className="text-red-600 text-xl font-semibold">
          Error: {(error as Error).message}
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen bg-[#f4faff]">
      <Sidebar />
      <main className="p-6 sm:p-10 flex flex-col gap-6 bg-[#f4faff]">
        <div className="bg-gradient-to-r from-[#8993ff] to-[#93acff] rounded-lg p-6 shadow-md">
          <h1 className="text-2xl font-bold text-[#666666] mb-4">
            Parent Management
          </h1>

          <div className="flex flex-wrap gap-4 bg-[#dbedff] p-4 rounded-md">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <div className="flex flex-wrap gap-3">
              <BaranggayFilter
                baranggays={getUniqueBaranggays(data?.data || [])}
                selectedBaranggay={selectedBaranggay}
                onBaranggayChange={setSelectedBaranggay}
              />

              <PurokFilter
                puroks={getUniquePuroks(data?.data || [])}
                selectedPurok={selectedPurok}
                onPurokChange={setSelectedPurok}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 border-2 border-[#accbff]">
          <ParentList
            filteredParents={filteredParents}
            editableData={editableData}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onChange={handleChange}
            onAddressChange={handleAddressChange}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            onCancel={handleCancel}
          />

          {filteredParents.length === 0 && (
            <div className="text-center py-12 text-[#333333] bg-[#f4faff] rounded-md border border-[#dbedff]">
              <p className="font-semibold text-lg">
                No parents found matching your search.
              </p>
              <p className="text-sm mt-2">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-sm text-[#333333]">
          <p>Total Parents: {filteredParents.length}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ParentManagement;
