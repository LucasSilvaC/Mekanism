import { ReactNode } from "react";

interface OnHoverProps {
  children: ReactNode;
  className?: string;
}

export const OnHover = ({ children, className = "" }: OnHoverProps) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1 cursor-pointer">
        {children}
      </div>
    </div>
  );
};
