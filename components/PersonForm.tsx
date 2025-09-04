import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import PlusIcon from './icons/PlusIcon';

interface PersonFormProps {
  onPersonImageUpload: (file: File) => void;
  personImageUrl: string | null;
  instructions: string;
  setInstructions: (instructions: string) => void;
  faceFidelity: number;
  setFaceFidelity: (value: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PersonForm: React.FC<PersonFormProps> = ({ 
    onPersonImageUpload,
    personImageUrl,
    instructions,
    setInstructions,
    faceFidelity,
    setFaceFidelity,
    onSubmit,
    isLoading 
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onPersonImageUpload(event.target.files[0]);
    }
  };
  
  const getFidelityDescription = (value: number): string => {
    if (value >= 95) {
      return "Maximum Fidelity: Aims for a 1:1 copy of the face. Highest accuracy, but may look less natural if lighting differs.";
    }
    if (value >= 70) {
      return "High Fidelity: Preserves face with very high accuracy. Allows minor AI adjustments for lighting.";
    }
    if (value >= 30) {
      return "Balanced: Good accuracy. Gives AI more freedom to blend lighting and angles for a natural look.";
    }
    return "Creative Blending: Prioritizes a seamless final image. Gives AI the most freedom to adjust the face to match the scene.";
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl shadow-xl w-full flex flex-col space-y-5 animate-fade-in">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload a photo of the person</label>
        <div 
          className="relative w-full h-40 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-brand-purple transition-colors"
          onClick={() => !isLoading && document.getElementById('person-file-upload')?.click()}
        >
          <input 
            type="file" 
            id="person-file-upload"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange} 
            disabled={isLoading}
          />
          {personImageUrl ? (
            <img src={personImageUrl} alt="Person to add" className="w-full h-full object-cover rounded-md" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-2">
                <PlusIcon className="w-8 h-8"/>
                <p className="font-semibold">Click to upload photo</p>
                <p className="text-xs">Make sure their face is clear</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-2">2. Add instructions (optional)</label>
        <textarea
          id="instructions"
          rows={3}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-colors"
          placeholder="e.g., 'Place them on the left, smiling.'"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="fidelity" className="block text-sm font-medium text-gray-300 mb-2">3. Face Matching Fidelity</label>
        <input
            id="fidelity"
            type="range"
            min="0"
            max="100"
            value={faceFidelity}
            onChange={(e) => setFaceFidelity(Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg [&::-webkit-slider-thumb]:bg-brand-purple"
            disabled={isLoading}
            style={{
                accentColor: '#6d28d9',
            }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>More AI Blending</span>
            <span>Exact Match</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 h-10 flex items-center">
          {getFidelityDescription(faceFidelity)}
        </p>
      </div>


      <button
        onClick={onSubmit}
        disabled={isLoading || !personImageUrl}
        className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Combining...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Combine Photos
          </>
        )}
      </button>
    </div>
  );
};

export default PersonForm;
