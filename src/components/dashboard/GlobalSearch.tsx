import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut,
} from "@/components/ui/command";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  group: string;
  tabId: string;
}

interface GlobalSearchProps {
  items: SearchResult[];
  onSelect: (tabId: string) => void;
}

export default function GlobalSearch({ items, onSelect }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const groups = items.reduce<Record<string, SearchResult[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 transition-colors w-40 sm:w-64"
      >
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">Search members, cells, events...</span>
        <span className="ml-auto hidden sm:inline text-[10px] border border-border rounded px-1 py-0.5">Ctrl K</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="hidden">
          <DialogTitle>Search the church portal</DialogTitle>
          <DialogDescription>Search members, cells, events, announcements, sermons, and books</DialogDescription>
        </DialogHeader>
        <CommandInput placeholder="Search members, cells, events, announcements..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groups).map(([group, groupItems]) => (
            <CommandGroup key={group} heading={group}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.sublabel || ""} ${group}`}
                  onSelect={() => {
                    onSelect(item.tabId);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.sublabel && <span className="text-[11px] text-muted-foreground">{item.sublabel}</span>}
                  </div>
                  <CommandShortcut>{group}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
