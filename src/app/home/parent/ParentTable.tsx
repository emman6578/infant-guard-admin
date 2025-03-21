import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ParentTableRow } from "./ParentTableRow";
import type { Parent } from "./types";

interface ParentTableProps {
  filteredParents: Parent[];
  editableData: { [key: string]: Parent };
  onEdit: (parent: Parent) => void;
  onSave: (parentId: string) => void;
  onDelete: (parentId: string) => void;
  onChange: (parentId: string, field: string, value: string) => void;
  onAddressChange: (parentId: string, field: string, value: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const ParentTable = ({
  filteredParents,
  editableData,
  onEdit,
  onSave,
  onDelete,
  onChange,
  onAddressChange,
  isUpdating,
  isDeleting,
}: ParentTableProps) => (
  <Table className="bg-white rounded-2xl text-gray-900">
    <TableHeader>
      <TableRow>
        <TableHead className="text-gray-900">Full Name</TableHead>
        <TableHead className="text-gray-900">Contact Number</TableHead>
        <TableHead className="text-gray-900">Email</TableHead>
        <TableHead className="text-gray-900">Address</TableHead>
        <TableHead className="text-gray-900">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {filteredParents.map((parent) => {
        const isEditing = !!editableData[parent.id];
        const currentParent = editableData[parent.id] || parent;

        return (
          <ParentTableRow
            key={parent.id}
            parent={parent}
            isEditing={isEditing}
            editableParent={currentParent}
            onEdit={() => onEdit(parent)}
            onSave={() => onSave(parent.id)}
            onDelete={() => onDelete(parent.id)}
            onChange={(field, value) => onChange(parent.id, field, value)}
            onAddressChange={(field, value) =>
              onAddressChange(parent.id, field, value)
            }
            isUpdating={isUpdating}
            isDeleting={isDeleting}
          />
        );
      })}
    </TableBody>
  </Table>
);
