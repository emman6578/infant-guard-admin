import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => (
  <Input
    placeholder="Search by name..."
    className="max-w-xs"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
);
