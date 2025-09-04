import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import OutfitForm from './components/OutfitForm';
import PersonForm from './components/PersonForm';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import { editImageWithCompanion } from './services/geminiService';
import { fileToGenerativePart, base64UrlToGenerativePart } from './utils/imageUtils';
import type { Part } from '@google/genai';
import { Gender } from './types';
import SparklesIcon from './components/icons/SparklesIcon';

type Mode = 'ai' | 'edit' | 'real';

const ModeButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand-purple ${
      isActive ? 'bg-brand-purple text-white shadow-md' : 'text-gray-300 hover:bg-gray-700'
    }`}
  >
    {label}
  </button>
);

function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  // Mode state
  const [mode, setMode] = useState<Mode>('ai');

  // AI Companion & Edit state
  const [gender, setGender] = useState<Gender>(Gender.GIRL);
  const [outfit, setOutfit] = useState<string>('');
  const [scene, setScene] = useState<string>('');
  const [expression, setExpression] = useState<string>('');
  const [isFaceLocked, setIsFaceLocked] = useState<boolean>(false);
  
  // Real Person state
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personImageUrl, setPersonImageUrl] = useState<string | null>(null);
  const [combineInstructions, setCombineInstructions] = useState<string>('');
  const [faceFidelity, setFaceFidelity] = useState<number>(100);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setOriginalImage(file);
    setOriginalImageUrl(URL.createObjectURL(file));
    setGeneratedImage(null);
    setError(null);
  };
  
  const handlePersonImageUpload = (file: File) => {
    setPersonImage(file);
    setPersonImageUrl(URL.createObjectURL(file));
  };


  const handleSubmit = useCallback(async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      let result;
      let baseImagePart: Part;
      let prompt: string;
      
      if (mode === 'ai') {
        let fidelityInstruction = '';
        if (faceFidelity >= 95) {
            fidelityInstruction = "CRITICAL INSTRUCTION: The face of the person in the original uploaded image MUST be preserved with 100% accuracy. Do not alter their facial features, structure, or identity in any way. Treat this as a command for a perfect, 1:1 copy of the original person's face.";
        } else if (faceFidelity >= 70) {
            fidelityInstruction = "The most important instruction is to preserve the face of the person from the original image with very high accuracy. Do not alter their core facial features or structure. The face in the final image must be clearly identifiable and nearly identical to the face in the original image. Minor adjustments for lighting integration are acceptable only if they do not change the person's identity.";
        } else if (faceFidelity >= 30) {
            fidelityInstruction = "Preserve the facial features from the original image with good accuracy, keeping the person's identity perfectly clear. You can make subtle adjustments to lighting, shadows, and angle to help the original person's face blend seamlessly into the new scene with the companion.";
        } else {
            fidelityInstruction = "Use the face from the original image as a strong reference, but prioritize creating a realistic and seamless final image. You have creative freedom to adjust the original person's facial lighting, perspective, and angles to perfectly match the environment with the new companion.";
        }
        
        if (isFaceLocked && generatedImage) {
            baseImagePart = base64UrlToGenerativePart(generatedImage);
            prompt = `This image contains two people. Keep both of their faces and bodies exactly the same. Only change the outfit of the ${gender} to: "${outfit}". Also, change the background scene to: "${scene}". The final image must be ultra-realistic.`;
        } else {
            if (!originalImage) throw new Error("Original image is missing.");
            baseImagePart = await fileToGenerativePart(originalImage);
            prompt = `First, strictly follow this instruction on face preservation for the person in the original photo: "${fidelityInstruction}". Next, add a ${gender} with a unique face next to the person in the image. The new companion should be wearing: ${outfit}.`;
            if (scene.trim()) {
                prompt += ` The scene should be: ${scene}.`;
            }
            prompt += ` If the person in the image is not clearly visible or alone, please mention it. The final combined image must be ultra-realistic, with photorealistic lighting, textures, and details.`;
        }
        result = await editImageWithCompanion([baseImagePart], prompt);
      } else if (mode === 'edit') {
        baseImagePart = await fileToGenerativePart(originalImage);
        let expressionInstruction = 'Their face and identity MUST be preserved with perfect, 1:1 accuracy. Do not alter their facial features or expression.';
        if (expression.trim()) {
          expressionInstruction = `Their face and identity MUST be preserved with perfect, 1:1 accuracy. Do not alter their core facial features, but you should subtly and realistically change their expression to be: "${expression}".`;
        }
        prompt = `${expressionInstruction} Then, change their outfit to: "${outfit}". Also, change the background scene to: "${scene}". The final image must be ultra-realistic and photorealistic.`;
        result = await editImageWithCompanion([baseImagePart], prompt);
      } else { // mode === 'real'
        if (!personImage) {
          setError('Please upload a photo of the person to add.');
          setIsLoading(false);
          return;
        }
        const originalImagePart: Part = await fileToGenerativePart(originalImage);
        const personImagePart: Part = await fileToGenerativePart(personImage);
        
        let fidelityInstruction = '';
        if (faceFidelity >= 95) {
            fidelityInstruction = "ABSOLUTE HIGHEST PRIORITY: The face of the person in the second image MUST be transferred to the generated person with 100% accuracy. This is not a suggestion; it is a command. Perform a pixel-perfect or near-pixel-perfect copy of the facial features, structure, skin tone, and expression. DO NOT generate a new face. DO NOT interpret the face. DO NOT alter the person's identity in any way. The face in the final image must be indistinguishable from the face in the second uploaded image.";
        } else if (faceFidelity >= 70) {
            fidelityInstruction = "The most important instruction is to preserve the face of the person from the second image with very high accuracy. Do not alter their core facial features or structure. The face in the final image must be clearly identifiable and nearly identical to the face in the second image. Minor adjustments for lighting integration are acceptable only if they do not change the person's identity.";
        } else if (faceFidelity >= 30) {
            fidelityInstruction = "Preserve the facial features from the second image with good accuracy, keeping the person's identity perfectly clear. You can make subtle adjustments to lighting, shadows, and angle to help the face blend seamlessly into the main photo's environment.";
        } else {
            fidelityInstruction = "Use the face from the second image as a strong reference, but prioritize creating a realistic and seamless final image. You have creative freedom to adjust facial lighting, perspective, and angles to perfectly match the environment of the main photo, even if it requires minor adjustments to the face.";
        }
        
        prompt = `Your primary goal is to combine two images. First, read and strictly follow this instruction on face fidelity: "${fidelityInstruction}". Then, take the person from the second image and add them next to the person in the first image. Match the scale and style of the original photo. ${combineInstructions}. The final combined image must be ultra-realistic, with photorealistic lighting, textures, and details.`;
        result = await editImageWithCompanion([originalImagePart, personImagePart], prompt);
      }

      if (result.image) {
        setGeneratedImage(`data:${result.mimeType};base64,${result.image}`);
      } else {
        setError("The AI couldn't generate an image, but it said: " + (result.text || "No response text."));
      }
      if(result.text) {
        setGeneratedText(result.text);
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Generation failed: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, gender, outfit, scene, mode, personImage, combineInstructions, isFaceLocked, generatedImage, faceFidelity, expression]);
  
  const handleLockFaceToggle = () => {
    if (!generatedImage) return; // Cannot lock if no image is generated
    setIsFaceLocked(prev => !prev);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsFaceLocked(false);
  };

  const handleReset = () => {
    setOriginalImage(null);
    setOriginalImageUrl(null);
    setGeneratedImage(null);
    setGeneratedText(null);
    setOutfit('');
    setScene('');
    setExpression('');
    setGender(Gender.GIRL);
    setPersonImage(null);
    setPersonImageUrl(null);
    setCombineInstructions('');
    setFaceFidelity(100);
    setMode('ai');
    setIsLoading(false);
    setError(null);
    setIsFaceLocked(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
            <SparklesIcon className="w-8 h-8 text-brand-purple" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
            AI Companion Photo
            </h1>
        </div>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Upload a selfie, choose a companion, describe their outfit, and let AI create the magic!
        </p>
      </header>
      
      <main className="w-full max-w-5xl flex-grow">
        {!originalImageUrl ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2 flex flex-col items-center">
              <div className="w-full aspect-square bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700 flex justify-center items-center">
                <img 
                  src={originalImageUrl} 
                  alt="Your upload" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={handleReset}
                className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Use a different photo
              </button>
            </div>
            
            <div className="lg:w-1/2 flex flex-col space-y-6">
              <div className="bg-gray-800/50 border border-gray-700 p-1 rounded-xl flex">
                <ModeButton label="AI Companion" isActive={mode === 'ai'} onClick={() => handleModeChange('ai')} />
                <ModeButton label="Edit My Photo" isActive={mode === 'edit'} onClick={() => handleModeChange('edit')} />
                <ModeButton label="Real Person" isActive={mode === 'real'} onClick={() => handleModeChange('real')} />
              </div>

              {mode === 'ai' || mode === 'edit' ? (
                 <OutfitForm 
                  formMode={mode}
                  gender={gender}
                  setGender={setGender}
                  outfit={outfit}
                  setOutfit={setOutfit}
                  scene={scene}
                  setScene={setScene}
                  expression={expression}
                  setExpression={setExpression}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                  isFaceLocked={isFaceLocked}
                  faceFidelity={faceFidelity}
                  setFaceFidelity={setFaceFidelity}
                />
              ) : (
                <PersonForm
                  onPersonImageUpload={handlePersonImageUpload}
                  personImageUrl={personImageUrl}
                  instructions={combineInstructions}
                  setInstructions={setCombineInstructions}
                  faceFidelity={faceFidelity}
                  setFaceFidelity={setFaceFidelity}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              )}

              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                  <p className="font-semibold">Oops! Something went wrong.</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {isLoading && <Loader />}
              
              {!isLoading && (generatedImage || generatedText) && (
                <ResultDisplay 
                  mode={mode}
                  generatedImage={generatedImage} 
                  generatedText={generatedText}
                  isFaceLocked={isFaceLocked}
                  onLockFaceToggle={handleLockFaceToggle}
                  onRegenerate={handleSubmit}
                />
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="w-full max-w-5xl text-center mt-12 text-gray-500 text-sm">
        <p>Powered by Gemini. Images are generated by AI and may be unrealistic.</p>
      </footer>
    </div>
  );
}

export default App;
