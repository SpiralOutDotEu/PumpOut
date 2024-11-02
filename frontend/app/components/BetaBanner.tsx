import React from "react";

const BetaBanner: React.FC = () => {
  return (
    <div className="bg-black text-yellow-300 border-b-2 border-yellow-400 py-2 text-center font-mono text-xs shadow-sm">
      <p>
        🚧 <strong>BETA WARNING:</strong> This project is a proof of concept. 
        Expect bugs and issues! Proceed with caution. 🚧
      </p>
    </div>
  );
};

export default BetaBanner;
