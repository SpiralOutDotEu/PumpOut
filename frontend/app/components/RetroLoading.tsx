import React from "react";

const RetroLoading = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="retro-loader">
        <div className="pixel-block pixel-block1"></div>
        <div className="pixel-block pixel-block2"></div>
        <div className="pixel-block pixel-block3"></div>
        <div className="pixel-block pixel-block4"></div>
      </div>
      <p className="ml-4 text-pixel font-mono text-xl text-white">Loading...</p>

      <style jsx>{`
        .retro-loader {
          display: flex;
          gap: 4px;
          animation: pixelBlink 1.5s infinite steps(5, start);
        }

        .pixel-block {
          width: 16px;
          height: 16px;
          background-color: #00ff00;
          border: 2px solid #000;
        }

        @keyframes pixelBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Individual animations to simulate pixel movement */
        .pixel-block1 {
          animation: pixelMove1 0.5s infinite;
        }
        .pixel-block2 {
          animation: pixelMove2 0.5s infinite;
        }
        .pixel-block3 {
          animation: pixelMove3 0.5s infinite;
        }
        .pixel-block4 {
          animation: pixelMove4 0.5s infinite;
        }

        @keyframes pixelMove1 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pixelMove2 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
        @keyframes pixelMove3 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pixelMove4 {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
      `}</style>
    </div>
  );
};

export default RetroLoading;
