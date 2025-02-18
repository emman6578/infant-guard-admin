import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressInputs } from "./AddressInputs";
import type { Parent } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";

interface ParentTableRowProps {
  parent: Parent;
  isEditing: boolean;
  editableParent: Parent;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (field: string, value: string) => void;
  onAddressChange: (field: string, value: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const ParentTableRow = ({
  isEditing,
  editableParent,
  onEdit,
  onSave,
  onDelete,
  onChange,
  onAddressChange,
  isUpdating,
  isDeleting,
}: ParentTableRowProps) => (
  <TableRow>
    <TableCell>
      <Input
        value={editableParent?.fullname}
        onChange={(e) => onChange("fullname", e.target.value)}
        disabled={!isEditing}
      />
    </TableCell>
    <TableCell>
      <Input
        value={editableParent?.contact_number}
        onChange={(e) => onChange("contact_number", e.target.value)}
        disabled={!isEditing}
      />
    </TableCell>
    <TableCell>
      <Input
        value={editableParent?.auth?.email}
        onChange={(e) => onChange("auth.email", e.target.value)}
        disabled={!isEditing}
      />
    </TableCell>
    <TableCell>
      <AddressInputs
        address={editableParent.address || {}}
        isEditing={isEditing}
        onChange={onAddressChange}
      />
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        {isEditing ? (
          <Button onClick={onSave} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        ) : (
          <>
            <Button onClick={onEdit}>Edit</Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </div>
    </TableCell>
  </TableRow>
);
