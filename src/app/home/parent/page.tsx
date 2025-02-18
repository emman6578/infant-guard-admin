"use client";

import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { ParentTable } from "./ParentTable";
import { SearchBar } from "./SearchBar";
import BaranggayFilter from "./BaranggayFilter";
import { Parent } from "./types";

const ParentManagement = () => {
  const queryClient = useQueryClient();
  const { parentsList, updateParent, deleteParent } = useProtectedRoutesApi();
  const [editableData, setEditableData] = useState<{ [key: string]: Parent }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBaranggay, setSelectedBaranggay] = useState("all");

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
        // Destructure to remove the existing id from updatedParent
        const { id: _, ...parentData } = updatedParent;

        await updateMutation.mutateAsync({
          id: parentId, // Use the parameter id explicitly
          ...parentData, // Spread remaining properties
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
        "Are you sure you want to delete this parent? This also delete infant's details corresponding with this Parent"
      )
    ) {
      deleteMutation.mutate(parentId);
    }
  };

  const handleChange = (parentId: string, field: string, value: string) => {
    setEditableData((prev) => {
      const currentParent = prev[parentId] ? { ...prev[parentId] } : {};
      const fields = field.split(".");

      // Traverse the nested fields to update the correct property
      let currentLevel: any = currentParent;
      for (let i = 0; i < fields.length - 1; i++) {
        const key = fields[i];
        // Create a new object if the key doesn't exist to avoid mutation
        if (!currentLevel[key]) currentLevel[key] = {};
        currentLevel = currentLevel[key];
      }

      // Set the final field value
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

  const getUniqueBaranggays = (parents: Parent[]) => {
    const baranggays = new Set(
      parents.map((parent) => parent?.address?.baranggay)
    );
    return Array.from(baranggays).sort();
  };

  const filteredParents =
    data?.data?.filter((parent) => {
      const matchesName = parent.fullname
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
      const matchesBaranggay =
        selectedBaranggay === "all" ||
        parent?.address?.baranggay === selectedBaranggay;
      return matchesName && matchesBaranggay;
    }) || [];

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[1fr_auto] min-h-screen ">
      <Sidebar />
      <main className="p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col gap-8 bg-[#026167]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-50">Parent Management</h1>
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <BaranggayFilter
            baranggays={getUniqueBaranggays(data?.data || [])}
            selectedBaranggay={selectedBaranggay}
            onBaranggayChange={setSelectedBaranggay}
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
              No parents found matching your search
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ParentManagement;
