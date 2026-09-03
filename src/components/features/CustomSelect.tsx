import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  className,
  required,
}: CustomSelectProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label className="font-sans text-xs uppercase tracking-widest text-line-black">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'select-line w-full',
            error ? 'border-red-500 focus:border-red-500' : '',
            !value && 'text-line-gray'
          )}
          required={required}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <p className="font-sans text-xs text-red-500">{error}</p>}
    </div>
  );
}
