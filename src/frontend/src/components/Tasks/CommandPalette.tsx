import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewTask: () => void;
  onSearch: () => void;
  onToggleView: () => void;
}

export default function CommandPalette({
  open,
  onOpenChange,
  onNewTask,
  onSearch,
  onToggleView,
}: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={onNewTask}>
            <Plus className="mr-2 h-4 w-4" />
            <span>New Task</span>
            <span className="ml-auto text-xs text-muted-foreground">N</span>
          </CommandItem>
          <CommandItem onSelect={onSearch}>
            <Search className="mr-2 h-4 w-4" />
            <span>Search Tasks</span>
            <span className="ml-auto text-xs text-muted-foreground">F</span>
          </CommandItem>
          <CommandItem onSelect={onToggleView}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Toggle View</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
