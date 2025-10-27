import { useState, useEffect } from "react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useStudents } from "@/hooks/useStudents";
import { useTeachers } from "@/hooks/useTeachers";
import { useClasses } from "@/hooks/useClasses";
import { User, GraduationCap, BookOpen, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { students } = useStudents();
  const { teachers } = useTeachers();
  const { classes } = useClasses();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.father_name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredTeachers = teachers?.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const filteredClasses = classes?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5) || [];

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder={t('searchPlaceholder')} 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Search className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{t('noData')}</p>
          </div>
        </CommandEmpty>
        
        {filteredStudents.length > 0 && (
          <CommandGroup heading={t('students')}>
            {filteredStudents.map((student) => (
              <CommandItem
                key={student.id}
                onSelect={() => handleSelect(() => navigate('/students'))}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{student.name} - {student.father_name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredTeachers.length > 0 && (
          <CommandGroup heading={t('teachers')}>
            {filteredTeachers.map((teacher) => (
              <CommandItem
                key={teacher.id}
                onSelect={() => handleSelect(() => navigate('/teachers'))}
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>{teacher.name} - {teacher.subject}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredClasses.length > 0 && (
          <CommandGroup heading={t('classes')}>
            {filteredClasses.map((cls) => (
              <CommandItem
                key={cls.id}
                onSelect={() => handleSelect(() => navigate('/classes'))}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{cls.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}