import React from 'react';

interface CustomButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

export default function CustomButton({ children, onClick }: CustomButtonProps) {
  return (
  <button type="button"
  onClick={onClick}
  className="px-5 py-2.5 rounded-lg text-white text-sm tracking-wider font-medium border border-current outline-none bg-blue-700 hover:bg-blue-800 active:bg-blue-700">{children}</button>

  );
}
