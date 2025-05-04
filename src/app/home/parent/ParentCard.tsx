"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressInputs } from "./AddressInputs";
import type { Parent } from "./types";
import { Card } from "@/components/ui/card";
import {
  Pencil,
  Save,
  Trash2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

// Color palette
const COLORS = {
  lightBg: "#f4faff",
  mediumBg: "#dbedff",
  accentLight: "#accbff",
  accentMedium: "#93acff",
  accentDark: "#8993ff",
  text: "#333333", // Dark gray for text
};

// Helper function to format the fullname
const formatFullName = (fullname?: string) => {
  if (!fullname) return "";
  const parts = fullname.trim().split(/\s+/);
  if (parts.length < 2) return fullname;
  const lastName = parts.pop()!;
  const firstName = parts.shift()!;
  const middleName = parts.join(" ");
  return `${lastName}, ${firstName}${middleName ? ` ${middleName}` : ""}`;
};

interface ParentCardProps {
  parent: Parent;
  isEditing: boolean;
  editableParent: Parent;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onChange: (field: string, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const ParentCard = ({
  parent,
  isEditing,
  editableParent,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onChange,
  onAddressChange,
  isUpdating,
  isDeleting,
}: ParentCardProps) => (
  <Card className="mb-6 overflow-hidden border-2 border-[#accbff] shadow-md hover:shadow-lg transition-all duration-300">
    {/* Header */}
    <div className="bg-gradient-to-r from-[#8993ff] to-[#93acff] p-3">
      <h3 className="text-white font-medium text-lg">
        {!isEditing
          ? formatFullName(editableParent?.fullname)
          : "Edit Parent Information"}
      </h3>
    </div>

    {/* Content */}
    <div className="p-5 bg-[#f4faff]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info Column */}
        <div className="space-y-4 bg-white p-4 rounded-lg border border-[#dbedff]">
          <h4 className="font-medium text-[#333333] border-b border-[#accbff] pb-2">
            Personal Information
          </h4>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#333333] flex items-center gap-2">
              <User className="h-4 w-4 text-[#8993ff]" />
              Full Name
            </label>
            <div
              className={`relative ${
                isEditing ? "bg-white" : "bg-[#f4faff]"
              } rounded`}
            >
              <Input
                value={
                  isEditing
                    ? editableParent?.fullname
                    : formatFullName(editableParent?.fullname)
                }
                onChange={(e) => onChange("fullname", e.target.value)}
                readOnly={!isEditing}
                className={`text-[#333333] ${
                  !isEditing
                    ? "border-transparent bg-[#f4faff] p-2 rounded"
                    : "border-[#accbff] focus:border-[#8993ff]"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#333333] flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#8993ff]" />
              Contact Number
            </label>
            <div
              className={`relative ${
                isEditing ? "bg-white" : "bg-[#f4faff]"
              } rounded`}
            >
              <Input
                value={editableParent?.contact_number}
                onChange={(e) => onChange("contact_number", e.target.value)}
                readOnly={!isEditing}
                className={`text-[#333333] ${
                  !isEditing
                    ? "border-transparent bg-[#f4faff] p-2 rounded"
                    : "border-[#accbff] focus:border-[#8993ff]"
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#333333] flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#8993ff]" />
              Email
            </label>
            <div
              className={`relative ${
                isEditing ? "bg-white" : "bg-[#f4faff]"
              } rounded`}
            >
              <Input
                value={editableParent?.auth?.email}
                onChange={(e) => onChange("auth.email", e.target.value)}
                readOnly={!isEditing}
                className={`text-[#333333] ${
                  !isEditing
                    ? "border-transparent bg-[#f4faff] p-2 rounded"
                    : "border-[#accbff] focus:border-[#8993ff]"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Address Column */}
        <div className="space-y-4 bg-white p-4 rounded-lg border border-[#dbedff]">
          <h4 className="font-medium text-[#333333] border-b border-[#accbff] pb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#8993ff]" />
            Address Information
          </h4>
          <AddressInputs
            address={editableParent.address || {}}
            isEditing={isEditing}
            onChange={onAddressChange}
          />
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-3 p-4 border-t border-[#dbedff] bg-white">
      {isEditing ? (
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUpdating}
            className="border-[#accbff] text-[#333333] hover:bg-[#f4faff] hover:border-[#8993ff]"
          >
            <X className="w-4 h-4 mr-2 text-[#8993ff]" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isUpdating}
            className="bg-[#8993ff] hover:bg-[#93acff] text-white border-none"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            onClick={onEdit}
            className="border-[#accbff] text-[#333333] hover:bg-[#f4faff] hover:border-[#8993ff]"
          >
            <Pencil className="w-4 h-4 mr-2 text-[#8993ff]" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
            className="border-[#accbff] text-[#333333] hover:bg-[#dbedff] hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </>
      )}
    </div>
  </Card>
);
