


export const Footer = ({ className = '' }: { className?: string }) => {
  return (
    <footer className={`w-full py-6 text-center text-sm mt-auto ${className || 'text-gray-400'}`}>
      <p>&copy; {new Date().getFullYear()} - Todos os direitos reservados por Synapse Code</p>
    </footer>
  );
};
