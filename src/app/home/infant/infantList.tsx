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
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";

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
  const uniqueBaranggays = React.useMemo(() => {
    if (!data?.data) return [];
    const baranggays = data.data
      .map((infant: any) => infant.address?.baranggay)
      .filter(Boolean);
    return [...new Set(baranggays)];
  }, [data?.data]);

  // Unique Puroks: now only show puroks associated with the selected baranggay (if not "All")
  const uniquePuroks = React.useMemo(() => {
    if (!data?.data) return [];
    let filteredData = data.data;
    if (selectedBaranggay !== "All") {
      filteredData = data.data.filter(
        (infant: any) => infant.address?.baranggay === selectedBaranggay
      );
    }
    const puroks = filteredData
      .map((infant: any) => infant.address?.purok)
      .filter(Boolean);
    return [...new Set(puroks)];
  }, [data?.data, selectedBaranggay]);

  const uniqueGenders = React.useMemo(() => {
    if (!data?.data) return [];
    const genders = data.data
      .map((infant: any) => infant.gender)
      .filter(Boolean);
    return [...new Set(genders)];
  }, [data?.data]);

  // Helper function to get surname for sorting
  const getSurnameForSorting = (fullname: string) => {
    if (!fullname) return "";
    const parts = fullname.trim().split(/\s+/);
    if (parts.length < 2) return fullname;
    return parts[parts.length - 1].toLowerCase(); // Get the last part as surname
  };

  // Filter infants based on search term and filter selections
  const filteredInfants = React.useMemo(() => {
    if (!data?.data) return [];
    return (
      data.data
        .filter((infant: any) => {
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
          return (
            matchesSearch && matchesPurok && matchesBaranggay && matchesGender
          );
        })
        // Alphabetical sorting by surname
        .sort((a: any, b: any) => {
          const surnameA = getSurnameForSorting(a.fullname);
          const surnameB = getSurnameForSorting(b.fullname);
          return surnameA.localeCompare(surnameB);
        })
    );
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-700 text-lg">
          Loading infant records...
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="bg-red-100 border border-red-400 text-gray-700 px-4 py-3 rounded relative">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error.message}</span>
      </div>
    );

  const formatFullName = (fullname?: string) => {
    if (!fullname) return "";
    const parts = fullname.trim().split(/\s+/);
    if (parts.length < 2) return fullname;
    const lastName = parts.pop()!;
    const firstName = parts.shift()!;
    const middleName = parts.join(" ");
    return `${lastName}, ${firstName}${middleName ? ` ${middleName}` : ""}`;
  };

  return (
    <div className="bg-[#f4faff] text-gray-800 p-6 rounded-lg shadow-sm">
      {/* Header with Title on the Left and Search/Filter on the Right */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Infant Records{" "}
          <span className="bg-[#accbff] px-2.5 py-1 rounded-full text-sm">
            {totalItems}
          </span>
        </h1>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-[#dbedff] bg-white rounded-md text-sm w-full md:w-56 focus:outline-none focus:ring-2 focus:ring-[#8993ff] text-gray-800"
              placeholder="Search by name"
            />
          </div>

          {/* Filter by Baranggay */}
          <div className="relative flex-1 md:flex-none">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <select
              value={selectedBaranggay}
              onChange={(e) => setSelectedBaranggay(e.target.value)}
              className="pl-10 pr-3 py-2 border border-[#dbedff] bg-white rounded-md text-sm w-full md:w-48 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8993ff] text-gray-800"
            >
              <option value="All">All Baranggays</option>
              {uniqueBaranggays.map((baranggay: string) => (
                <option key={baranggay} value={baranggay}>
                  {baranggay}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Purok */}
          {selectedBaranggay !== "All" && (
            <div className="relative flex-1 md:flex-none">
              <select
                value={selectedPurok}
                onChange={(e) => setSelectedPurok(e.target.value)}
                className="pl-3 pr-3 py-2 border border-[#dbedff] bg-white rounded-md text-sm w-full md:w-36 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8993ff] text-gray-800"
              >
                <option value="All">All Puroks</option>
                {uniquePuroks.map((purok: string) => (
                  <option key={purok} value={purok}>
                    {purok}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter by Gender */}
          <div className="relative flex-1 md:flex-none">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="pl-3 pr-3 py-2 border border-[#dbedff] bg-white rounded-md text-sm w-full md:w-28 appearance-none focus:outline-none focus:ring-2 focus:ring-[#8993ff] text-gray-800"
            >
              <option value="All">Sex</option>
              {uniqueGenders.map((gender: string) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Toolbar with Select All and Delete Selected */}
      <div className="flex flex-wrap justify-between items-center mb-4 bg-[#dbedff] p-3 rounded-md">
        <div className="flex items-center">
          <Checkbox
            checked={
              selectedInfantIds.length === paginatedInfants.length &&
              paginatedInfants.length > 0
            }
            onCheckedChange={handleSelectAll}
            className="mr-2 border-[#8993ff]"
          />
          <span className="text-sm text-gray-700">Select All</span>
        </div>

        <Button
          variant="destructive"
          onClick={handleDeleteSelected}
          disabled={selectedInfantIds.length === 0}
          className="bg-[#972929] hover:bg-[#93acff] text-white flex items-center gap-2"
        >
          <Trash2 size={16} />
          {deleteMutation.isPending
            ? "Deleting..."
            : `Delete Selected (${selectedInfantIds.length})`}
        </Button>
      </div>

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* No results message */}
      {paginatedInfants.length === 0 && (
        <div className="bg-white rounded-lg p-8 text-center border border-[#dbedff]">
          <div className="text-gray-600 mb-2">
            No infants match your search criteria
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedBaranggay("All");
              setSelectedPurok("All");
              setSelectedGender("All");
            }}
            className="border-[#accbff] text-[#8993ff] hover:bg-[#f4faff]"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* List of Infants */}
      {paginatedInfants.length > 0 && (
        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {paginatedInfants.map((infant: any) => (
              <div
                key={infant.id}
                className={`bg-white border border-[#dbedff] p-4 rounded-lg transition-all flex items-center gap-4 bg-red-400${
                  selectedInfantIds.includes(infant.id)
                    ? "ring-2 ring-[#8993ff] shadow-md"
                    : "hover:shadow-md"
                }`}
              >
                <Checkbox
                  checked={selectedInfantIds.includes(infant.id)}
                  onCheckedChange={() => handleCheckboxChange(infant.id)}
                  className="border-[#8993ff]"
                />

                {/* Infant Image (clickable for upload) */}
                <div
                  onClick={(e) => handleImageClick(e, infant.id)}
                  className="relative cursor-pointer group"
                >
                  {uploadingImageId === infant.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
                      <div className="animate-spin h-4 w-4 border-2 border-[#8993ff] border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {infant.image && isValidImageUrl(infant.image) ? (
                    <div className="relative">
                      <Image
                        src={infant.image}
                        alt={infant.fullname}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#accbff]"
                        width={100}
                        height={100}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all group-hover:bg-opacity-20">
                        <Upload
                          size={16}
                          className="text-white opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#dbedff] flex items-center justify-center border-2 border-[#accbff] relative">
                      <span className="text-gray-500 text-xs">No Image</span>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-full flex items-center justify-center transition-all group-hover:bg-opacity-10">
                        <Upload
                          size={16}
                          className="text-gray-600 opacity-0 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Infant Details (navigates to details on click) */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() =>
                    router.push(`/home/infant/details?id=${infant.id}`)
                  }
                >
                  <h2 className="text-lg font-semibold text-gray-800">
                    {formatFullName(infant.fullname)}
                  </h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="font-medium">Sex:</span> {infant.gender}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="font-medium">Weight:</span>{" "}
                      {infant.weight} kg
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="font-medium">Height:</span>{" "}
                      {infant.height} cm
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar size={14} className="inline" />
                      <span>
                        {infant.birthday.month}/{infant.birthday.day}/
                        {infant.birthday.year}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  onClick={(e) => handleEditClick(e, infant)}
                  className="bg-[#93acff] hover:bg-[#8993ff] text-white p-2 h-8 w-8"
                  size="sm"
                >
                  <Edit size={16} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Edit Infant Modal */}
      <InfantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        infant={selectedInfant}
      />

      {/* Pagination and Items Per Page Controls */}
      {paginatedInfants.length > 0 && (
        <div className="mt-6 bg-white p-3 rounded-lg border border-[#dbedff] flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Items per Page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-md p-1 text-sm border-[#dbedff] focus:outline-none focus:ring-2 focus:ring-[#8993ff]"
            >
              {[10, 20, 30, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Page Info */}
          <span className="text-sm text-gray-600">
            Showing {paginatedInfants.length} of {totalItems} infants | Page{" "}
            {currentPage} of {totalPages || 1}
          </span>

          {/* Pagination Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-[#dbedff] hover:bg-[#f4faff] text-gray-700 p-2 h-9 w-9"
              size="sm"
            >
              <ChevronLeft size={18} />
            </Button>

            {/* Page Number Buttons */}
            <div className="flex items-center">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`mx-0.5 h-9 w-9 ${
                      currentPage === pageNum
                        ? "bg-[#8993ff] hover:bg-[#93acff] text-white"
                        : "border-[#dbedff] hover:bg-[#f4faff] text-gray-700"
                    }`}
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages || totalItems === 0}
              className="border-[#dbedff] hover:bg-[#f4faff] text-gray-700 p-2 h-9 w-9"
              size="sm"
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfantList;
