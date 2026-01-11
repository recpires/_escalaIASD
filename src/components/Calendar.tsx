import React from 'react';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';

interface CalendarProps {
  // selectedDates is deprecated in favor of dateMetadata, but kept for compatibility logic helper
  selectedDates?: string[]; 
  // Map date -> { color: string (hex or class), label?: string }
  dateMetadata?: {
    [date: string]: {
      color?: string;
      label?: string;
      selected?: boolean;
    }
  };
  onDateClick: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ selectedDates = [], dateMetadata = {}, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = React.useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 p-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 p-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const metadata = dateMetadata[dateStr];
          const isSelected = selectedDates.includes(dateStr) || metadata?.selected;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          
          // Determine styling based on metadata
          let customStyle = {};
          let customClass = "";
          
          if (metadata?.color) {
            // Check if it's a tailwind class or hex
            if (metadata.color.startsWith('bg-') || metadata.color.startsWith('text-')) {
               customClass = metadata.color;
            } else {
               customStyle = { backgroundColor: metadata.color, color: '#fff' };
            }
          }

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(dateStr)}
              style={customStyle}
              className={clsx(
                "h-10 w-full rounded-lg flex items-center justify-center text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sda-blue/50",
                !isCurrentMonth && "text-gray-300",
                isCurrentMonth && !metadata?.color && "text-gray-700 hover:bg-gray-100",
                // Default selection style if no custom color provided
                isSelected && !metadata?.color && "bg-sda-blue text-white font-bold hover:bg-sda-blue/90 shadow-sm",
                // Today style
                isDayToday && !isSelected && !metadata?.color && "border border-sda-gold text-sda-blue font-bold",
                customClass
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-sda-blue rounded mr-1"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 border border-gray-200 bg-white rounded mr-1"></div>
          <span>Indisponível</span>
        </div>
      </div>
    </div>
  );
};
