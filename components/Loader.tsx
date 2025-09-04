
import React from 'react';

const loadingMessages = [
    "Warming up the AI's imagination...",
    "Mixing digital paints...",
    "Finding the perfect pose...",
    "Tailoring the virtual outfit...",
    "Teaching the AI to smile...",
    "Almost picture perfect...",
];

const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);


  return (
    <div className="w-full flex flex-col items-center justify-center p-8 bg-gray-800/50 border border-gray-700 rounded-2xl text-center space-y-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 border-4 border-t-transparent border-purple-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin-slow"></div>
        <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 2s linear infinite;
            }
        `}</style>
      </div>
      <p className="text-lg font-semibold text-white">{message}</p>
      <p className="text-sm text-gray-400">This can take a moment, especially for complex outfits.</p>
    </div>
  );
};

export default Loader;
