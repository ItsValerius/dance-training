"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";

/** Searchable chip picker that submits one `name` field per picked value. */
export function MultiPicker({
  name,
  options,
  defaultValue = [],
  id,
  ariaLabel,
  placeholder,
  empty = "Nichts gefunden.",
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string[];
  id?: string;
  ariaLabel?: string;
  placeholder: string;
  empty?: string;
}) {
  const [selected, setSelected] = useState(defaultValue);
  const anchor = useComboboxAnchor();
  const labels = new Map(options.map((o) => [o.value, o.label]));
  const label = (v: string) => labels.get(v) ?? "";

  return (
    <>
      {selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <Combobox multiple autoHighlight items={options.map((o) => o.value)} itemToStringLabel={label} value={selected} onValueChange={setSelected}>
        <ComboboxChips ref={anchor} className="min-h-11 bg-card px-2 py-1.5 text-base">
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((v) => (
                  <ComboboxChip key={v} className="bg-secondary text-secondary-foreground">
                    {label(v)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput id={id} aria-label={ariaLabel} placeholder={values.length ? "" : placeholder} />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>{options.length ? empty : "Noch keine vorhanden."}</ComboboxEmpty>
          <ComboboxList>
            {(v: string) => (
              <ComboboxItem key={v} value={v}>
                {label(v)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}
