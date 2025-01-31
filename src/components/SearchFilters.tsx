import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  onFilterChange: (type: string, value: string) => void;
}

export const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      <Select onValueChange={(value) => onFilterChange('trend', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Trend" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="rising">Rising</SelectItem>
          <SelectItem value="viral">Viral</SelectItem>
          <SelectItem value="new">New</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onFilterChange('activity', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Insider Activity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => onFilterChange('potential', value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Mooner Potential" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="very-high">Very High</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};