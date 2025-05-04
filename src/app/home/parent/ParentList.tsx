import { Parent } from "../page";
import { ParentCard } from "./ParentCard";

interface ParentListProps {
  filteredParents: Parent[];
  editableData: { [key: string]: Parent };
  onEdit: any;
  onSave: (parentId: string) => void;
  onCancel: (parentId: string) => void;
  onDelete: (parentId: string) => void;
  onChange: (parentId: string, field: string, value: string) => void;
  onAddressChange: (parentId: string, field: string, value: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const ParentList = ({
  filteredParents,
  editableData,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onChange,
  onAddressChange,
  isUpdating,
  isDeleting,
}: ParentListProps) => (
  <div className="space-y-4">
    {filteredParents.map((parent) => {
      const isEditing = !!editableData[parent.id];
      const currentParent = editableData[parent.id] || parent;

      return (
        <ParentCard
          key={parent.id}
          parent={parent}
          isEditing={isEditing}
          editableParent={currentParent}
          onEdit={() => onEdit(parent)}
          onSave={() => onSave(parent.id)}
          onCancel={() => onCancel(parent.id)}
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
  </div>
);
