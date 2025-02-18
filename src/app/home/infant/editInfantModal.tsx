"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProtectedRoutesApi } from "@/libraries/API/ProtectedRoute/secureRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

interface InfantModalProps {
  isOpen: boolean;
  onClose: () => void;
  infant: {
    id: string;
    fullname: string;
    place_of_birth: string;
    height: string;
    gender: string;
    weight: string;
    health_center: string;
    family_no: string;
  } | null;
}

const InfantModal: React.FC<InfantModalProps> = ({
  isOpen,
  onClose,
  infant,
}) => {
  const { updateInfant } = useProtectedRoutesApi();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ data, id }: { data: any; id: string }) =>
      updateInfant(data, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["infants"] });
    },
  });

  // Form state – only fields that the user modifies will be sent.
  const [fullname, setFullname] = useState("");
  const [place_of_birth, setPlaceOfBirth] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [health_center, setHealthCenter] = useState("");
  const [family_no, setFamilyNo] = useState("");

  // Optionally clear the form (only clearing the updated fields).
  const clearForm = () => {
    setFullname("");
    setPlaceOfBirth("");
    setHeight("");
    setGender("");
    setWeight("");
    setHealthCenter("");
    setFamilyNo("");
  };

  // Validation rules:
  // Only letters and spaces for fullname, place_of_birth, and health_center.
  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    // This regex allows only letters (upper/lowercase) and spaces.
    if (/^[A-Za-z\s]*$/.test(value)) {
      setter(value);
    }
  };

  // Allow numbers with up to 2 decimal places.
  const handleDecimalChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value;
    // The regex matches an optional number with an optional decimal point followed by up to two digits.
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setter(value);
    }
  };

  const handleSave = async () => {
    // Build data object – include only fields the user modified.
    const data: any = {
      ...(fullname && { fullname }),
      ...(place_of_birth && { place_of_birth }),
      ...(height && { height: Number(height) }),
      ...(weight && { weight: Number(weight) }),
      ...(gender && { gender }),
      ...(health_center && { health_center }),
      ...(family_no && { family_no: Number(family_no) }),
    };

    try {
      await updateMutation.mutateAsync({ data, id: infant!.id });
      clearForm();
    } catch (error) {
      console.error("Error updating infant:", error);
    }

    onClose();
  };

  if (!infant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Infant</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Full Name */}
          <div className="flex flex-col">
            <label
              htmlFor="fullname"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <Input
              id="fullname"
              value={fullname}
              onChange={(e) => handleTextChange(e, setFullname)}
              placeholder={infant.fullname}
            />
          </div>

          {/* Place of Birth */}
          <div className="flex flex-col">
            <label
              htmlFor="place_of_birth"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Place of Birth
            </label>
            <Input
              id="place_of_birth"
              value={place_of_birth}
              onChange={(e) => handleTextChange(e, setPlaceOfBirth)}
              placeholder={infant.place_of_birth}
            />
          </div>

          {/* Physical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="height"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Height
              </label>
              <Input
                id="height"
                value={height}
                onChange={(e) => handleDecimalChange(e, setHeight)}
                placeholder={infant.height}
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="weight"
                className="mb-1 text-sm font-medium text-gray-700"
              >
                Weight
              </label>
              <Input
                id="weight"
                value={weight}
                onChange={(e) => handleDecimalChange(e, setWeight)}
                placeholder={infant.weight}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label
              htmlFor="gender"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Health Center */}
          <div className="flex flex-col">
            <label
              htmlFor="health_center"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Health Center
            </label>
            <Input
              id="health_center"
              value={health_center}
              onChange={(e) => handleTextChange(e, setHealthCenter)}
              placeholder={infant.health_center}
            />
          </div>

          {/* Family Number */}
          <div className="flex flex-col">
            <label
              htmlFor="family_no"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Family Number
            </label>
            <select
              id="family_no"
              value={family_no}
              onChange={(e) => setFamilyNo(e.target.value)}
              className="border rounded p-2"
            >
              <option value="">Select Family Number</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={updateMutation.isLoading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfantModal;
