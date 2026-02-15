interface ContentWrapperProps {
  children: React.ReactNode;
  maxWidth?: "default" | "wide" | "full";
  className?: string;
}

export default function ContentWrapper({
  children,
  maxWidth = "default",
  className = "",
}: ContentWrapperProps) {
  const maxWidthClass = {
    default: "max-w-[1200px]",
    wide: "max-w-[1400px]",
    full: "max-w-full",
  }[maxWidth];

  return (
    <div className={`${maxWidthClass} mx-auto px-8 w-full ${className}`}>
      {children}
    </div>
  );
}
