"use client";

import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InfantModal from "./editInfantModal";
import { useRouter } from "next/navigation";

const InfantList = () => {
  const { infantList, deleteInfants, UploadChildProfileImage } =
    useProtectedRoutesApi();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Search and Filter States
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedPurok, setSelectedPurok] = React.useState("All");
  const [selectedBaranggay, setSelectedBaranggay] = React.useState("All");
  const [selectedGender, setSelectedGender] = React.useState("All");

  // Pagination and selection states
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [selectedInfantIds, setSelectedInfantIds] = React.useState<string[]>(
    []
  );
  const [selectedInfant, setSelectedInfant] = React.useState<any>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Reference to the hidden file input for image upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeInfantId, setActiveInfantId] = React.useState<string | null>(
    null
  );
  const [uploadingImageId, setUploadingImageId] = React.useState<string | null>(
    null
  );

  // Fetch all infants
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["infants"],
    queryFn: infantList,
  });

  // Mutation for deleting infants
  const deleteMutation = useMutation({
    mutationFn: deleteInfants,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infants"] });
      setSelectedInfantIds([]); // Clear selection after delete
    },
    onError: (err: any) => {
      console.error("Delete failed:", err.message);
      alert(`Error: ${err.message}`);
    },
  });

  // Mutation for uploading an image
  const uploadImageMutation = useMutation({
    mutationFn: ({ id, imageFile }: { id: string; imageFile: File }) =>
      UploadChildProfileImage(id, imageFile),
    onMutate: ({ id }) => {
      setUploadingImageId(id);
    },
    onSettled: () => {
      setUploadingImageId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
    onError: (err: any) => {
      console.error("Image upload failed:", err.message);
      alert(`Error: ${err.message}`);
    },
  });

  // Reset current page whenever search or any filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedPurok, selectedBaranggay, selectedGender]);

  // Compute unique dropdown values from data for filtering
  const uniquePuroks = React.useMemo(() => {
    if (!data?.data) return [];
    const puroks = data.data
      .map((infant: any) => infant.address?.purok)
      .filter(Boolean);
    return [...new Set(puroks)];
  }, [data?.data]);

  const uniqueBaranggays = React.useMemo(() => {
    if (!data?.data) return [];
    const baranggays = data.data
      .map((infant: any) => infant.address?.baranggay)
      .filter(Boolean);
    return [...new Set(baranggays)];
  }, [data?.data]);

  const uniqueGenders = React.useMemo(() => {
    if (!data?.data) return [];
    const genders = data.data
      .map((infant: any) => infant.gender)
      .filter(Boolean);
    return [...new Set(genders)];
  }, [data?.data]);

  // Filter infants based on search term and filter selections
  const filteredInfants = React.useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((infant: any) => {
      const matchesSearch = infant.fullname
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPurok =
        selectedPurok === "All" || infant.address?.purok === selectedPurok;
      const matchesBaranggay =
        selectedBaranggay === "All" ||
        infant.address?.baranggay === selectedBaranggay;
      const matchesGender =
        selectedGender === "All" || infant.gender === selectedGender;
      return matchesSearch && matchesPurok && matchesBaranggay && matchesGender;
    });
  }, [
    data?.data,
    searchTerm,
    selectedPurok,
    selectedBaranggay,
    selectedGender,
  ]);

  // Pagination calculations based on the filtered infants
  const totalItems = filteredInfants.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInfants = filteredInfants.slice(startIndex, endIndex);

  const isValidImageUrl = (url: string) => {
    return (
      url.startsWith("/") ||
      url.startsWith("http://") ||
      url.startsWith("https://")
    );
  };

  const handleCheckboxChange = (infantId: string) => {
    setSelectedInfantIds((prev) =>
      prev.includes(infantId)
        ? prev.filter((id) => id !== infantId)
        : [...prev, infantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInfantIds.length === paginatedInfants.length) {
      setSelectedInfantIds([]);
    } else {
      setSelectedInfantIds(paginatedInfants.map((infant: any) => infant.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedInfantIds.length === 0) {
      alert("No infants selected for deletion.");
      return;
    }
    deleteMutation.mutate(selectedInfantIds);
  };

  // Prevent card click propagation when clicking Edit
  const handleEditClick = (e: React.MouseEvent, infant: any) => {
    e.stopPropagation();
    setSelectedInfant(infant);
    setIsModalOpen(true);
  };

  // Trigger hidden file input when clicking on the image
  const handleImageClick = (e: React.MouseEvent, infantId: string) => {
    e.stopPropagation();
    setActiveInfantId(infantId);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  // Handle file change for image upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && activeInfantId) {
      const file = event.target.files[0];
      uploadImageMutation.mutate({ id: activeInfantId, imageFile: file });
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <>
      {/* Header with Title on the Left and Search/Filter on the Right */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Infant List ({totalItems})</h1>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md p-1 text-sm"
            placeholder="Search by fullname"
          />
          {/* Filter by Purok */}
          <select
            value={selectedPurok}
            onChange={(e) => setSelectedPurok(e.target.value)}
            className="border rounded-md p-1 text-sm"
          >
            <option value="All">All Puroks</option>
            {uniquePuroks.map((purok: string) => (
              <option key={purok} value={purok}>
                {purok}
              </option>
            ))}
          </select>
          {/* Filter by Baranggay */}
          <select
            value={selectedBaranggay}
            onChange={(e) => setSelectedBaranggay(e.target.value)}
            className="border rounded-md p-1 text-sm"
          >
            <option value="All">All Baranggays</option>
            {uniqueBaranggays.map((baranggay: string) => (
              <option key={baranggay} value={baranggay}>
                {baranggay}
              </option>
            ))}
          </select>
          {/* Filter by Gender */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="border rounded-md p-1 text-sm"
          >
            <option value="All">All Genders</option>
            {uniqueGenders.map((gender: string) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Select All Checkbox */}
      <div className="flex items-center mb-2">
        <Checkbox
          checked={
            selectedInfantIds.length === paginatedInfants.length &&
            paginatedInfants.length > 0
          }
          onCheckedChange={handleSelectAll}
          className="mr-2"
        />
        <span className="text-sm">Select All</span>
      </div>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* List of Infants */}
      <ScrollArea className="h-full pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {paginatedInfants.map((infant: any) => (
            <div
              key={infant.id}
              className="border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <Checkbox
                checked={selectedInfantIds.includes(infant.id)}
                onCheckedChange={() => handleCheckboxChange(infant.id)}
                className="mr-2"
              />

              {/* Edit Infant Modal */}
              <InfantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                infant={selectedInfant}
              />

              <Button onClick={(e) => handleEditClick(e, infant)}>Edit</Button>

              {/* Infant Image (clickable for upload) */}
              <div
                onClick={(e) => handleImageClick(e, infant.id)}
                className="relative cursor-pointer"
              >
                {uploadingImageId === infant.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="loader">Uploading...</div>
                  </div>
                )}
                {infant.image && isValidImageUrl(infant.image) ? (
                  <Image
                    src={infant.image}
                    alt={infant.fullname}
                    className="w-16 h-16 rounded-full object-cover"
                    width={100}
                    height={100}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>

              {/* Infant Details (navigates to details on click) */}
              <div
                onClick={() =>
                  router.push(`/home/infant/details?id=${infant.id}`)
                }
              >
                <h2 className="text-lg font-semibold">{infant.fullname}</h2>
                <p className="text-sm text-gray-600">
                  Gender: {infant.gender}
                  <br />
                  Weight: {infant.weight} kg
                  <br />
                  Height: {infant.height} cm
                  <br />
                  Birthday: {infant.birthday.month}/{infant.birthday.day}/
                  {infant.birthday.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Pagination and Items Per Page Controls */}
      <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Items per Page */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded-md p-1 text-sm"
          >
            {[10, 20, 30, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Pagination Buttons and Page Info */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages} | Showing{" "}
            {paginatedInfants.length} of {totalItems} infants
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages || totalItems === 0}
          >
            Next
          </Button>
        </div>

        {/* Delete Selected Button */}
        <div>
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedInfantIds.length === 0}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default InfantList;
