import { Input } from "@/components/ui/input";

interface AddressInputsProps {
  address?: {
    purok?: string;
    baranggay?: string;
    municipality?: string;
    province?: string;
  };
  isEditing: boolean;
  onChange: (field: string, value: string) => void;
}

export const AddressInputs = ({
  address,
  isEditing,
  onChange,
}: AddressInputsProps) => {
  // Provide default values for address properties
  const {
    purok = "",
    baranggay = "",
    municipality = "",
    province = "",
  } = address || {};

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={purok}
        onChange={(e) => onChange("purok", e.target.value)}
        disabled={!isEditing}
        placeholder="Purok"
      />
      <Input
        value={baranggay}
        onChange={(e) => onChange("baranggay", e.target.value)}
        disabled={!isEditing}
        placeholder="Baranggay"
      />
      <Input
        value={municipality}
        onChange={(e) => onChange("municipality", e.target.value)}
        disabled={!isEditing}
        placeholder="Municipality"
      />
      <Input
        value={province}
        onChange={(e) => onChange("province", e.target.value)}
        disabled={!isEditing}
        placeholder="Province"
      />
    </div>
  );
};
