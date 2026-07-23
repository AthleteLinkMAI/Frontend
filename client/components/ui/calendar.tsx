import * as React from "react";
import { useState } from "react";
import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface CalendarProps {
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void;
  mode?: "single" | "multiple" | "range";
  defaultMonth?: Date;
  disabled?: Matcher | Matcher[];
  initialFocus?: boolean;
}

export function Calendar({
  selected,
  onSelect,
  mode = "single",
  defaultMonth,
  disabled,
  initialFocus = false,
}: CalendarProps) {

  const [currentMonth, setCurrentMonth] = useState(defaultMonth || new Date());
  return (
    <div className="p-4 rounded-md border bg-white shadow-md">
      <DayPicker
          mode={mode}
          selected={selected as any}
          onSelect={onSelect as any}
          defaultMonth={defaultMonth}
          month={currentMonth}
          onMonthChange={(m) => setCurrentMonth(m)}
          disabled={disabled}
          initialFocus={initialFocus}
          showOutsideDays
          weekStartsOn={0}
          components={{
            Caption: () => (
              <div className="flex justify-between items-center px-2 mb-3">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1)
                    )
                  }
                  className="px-2 py-1 text-lg"
                >
                  «
                </button>

                <div className="flex gap-2">
                  <select
                    value={currentMonth.getMonth()}
                    onChange={(e) =>
                      setCurrentMonth(
                        new Date(
                          currentMonth.getFullYear(),
                          Number(e.target.value),
                          1
                        )
                      )
                    }
                    className="border rounded px-1 py-0.5 bg-white"
                  >
                    {[
                      "Январь",
                      "Февраль",
                      "Март",
                      "Апрель",
                      "Май",
                      "Июнь",
                      "Июль",
                      "Август",
                      "Сентябрь",
                      "Октябрь",
                      "Ноябрь",
                      "Декабрь",
                    ].map((m, i) => (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select
                    value={currentMonth.getFullYear()}
                    onChange={(e) =>
                      setCurrentMonth(
                        new Date(
                          Number(e.target.value),
                          currentMonth.getMonth(),
                          1
                        )
                      )
                    }
                    className="border rounded px-1 py-0.5 bg-white"
                  >
                    {Array.from({ length: 80 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1)
                    )
                  }
                  className="px-2 py-1 text-lg"
                >
                  »
                </button>
              </div>
            ),
          }}
      />
    </div>
  );
}