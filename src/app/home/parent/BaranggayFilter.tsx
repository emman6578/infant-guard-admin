import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      {baranggays?.map((baranggay) => (
        <SelectItem key={baranggay || "unknown"} value={baranggay}>
          {baranggay}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);
export default BaranggayFilter;
