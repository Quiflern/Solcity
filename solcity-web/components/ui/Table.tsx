import type { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableHeadProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full border-collapse ${className}`}>{children}</table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }: TableRowProps) {
  return <tr className={className}>{children}</tr>;
}

export function TableHead({ children, className = "" }: TableHeadProps) {
  return (
    <th
      className={`text-left text-[0.7rem] uppercase text-text-primary font-semibold p-4 border-b border-border tracking-wider bg-[#0a0a0a] ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: TableCellProps) {
  return (
    <td className={`py-5 px-4 border-b border-border text-sm ${className}`}>
      {children}
    </td>
  );
}
