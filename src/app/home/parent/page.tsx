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
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter by Baranggay" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Baranggays</SelectItem>
      {baranggays.map((baranggay) => (
        <SelectItem key={baranggay} value={baranggay}>
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
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Filter by Purok" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Puroks</SelectItem>
      {puroks.map((purok) => (
        <SelectItem key={purok} value={purok}>
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
  const filteredParents =
    data?.data?.filter((parent: any) => {
      const matchesName = parent.fullname
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const matchesBaranggay =
        selectedBaranggay === "all" ||
        parent?.address?.baranggay === selectedBaranggay;
      const matchesPurok =
        selectedPurok === "all" || parent?.address?.purok === selectedPurok;
      return matchesName && matchesBaranggay && matchesPurok;
    }) || [];

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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen">
      <Sidebar />
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8 bg-[#026167]">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-cyan-50">Parent Management</h1>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
        <div>
          <ParentTable
            filteredParents={filteredParents}
            editableData={editableData}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onChange={handleChange}
            onAddressChange={handleAddressChange}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
          {filteredParents.length === 0 && (
            <div className="text-center py-4 text-black">
              No parents found matching your search.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ParentManagement;
