export default function ShinyText({ children }) {
  return (
    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient">
      {children}

      <style>
        {`
          @keyframes gradientMove {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }

          .animate-gradient {
            background-size: 200% auto;
            animation: gradientMove 3s linear infinite;
          }
        `}
      </style>
    </span>
  );
}
