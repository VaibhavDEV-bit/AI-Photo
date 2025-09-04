// FIX: Imported `Dispatch` and `SetStateAction` from React to correctly type the `setScene` prop for functional updates.
import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Gender } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import WandIcon from './icons/WandIcon';

interface OutfitFormProps {
  formMode: 'ai' | 'edit';
  gender: Gender;
  setGender: (gender: Gender) => void;
  outfit: string;
  setOutfit: (outfit: string) => void;
  scene: string;
  // FIX: Corrected the type of the `setScene` prop to `Dispatch<SetStateAction<string>>` to support functional state updates, resolving a TypeScript error.
  setScene: Dispatch<SetStateAction<string>>;
  expression: string;
  setExpression: (expression: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isFaceLocked: boolean;
  faceFidelity: number;
  setFaceFidelity: (value: number) => void;
}

const GenderButton: React.FC<{
  label: string;
  value: Gender;
  currentValue: Gender;
  onClick: (value: Gender) => void;
}> = ({ label, value, currentValue, onClick }) => {
  const isActive = value === currentValue;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`w-full py-3 px-4 rounded-lg text-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-purple
        ${isActive ? 'bg-brand-purple text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
    >
      {label}
    </button>
  );
};

type OutfitCategory = {
  name: string;
  neutral?: string[];
  guy?: string[];
  girl?: string[];
  for?: Gender;
};

const outfitCategories: OutfitCategory[] = [
    { 
        name: 'Casual', 
        neutral: [
            'a comfortable gray hoodie, dark wash jeans, and stylish sneakers',
            'a relaxed-fit flannel shirt over a plain t-shirt, with khaki pants',
            'a simple crewneck sweater and black joggers',
        ],
        guy: [
          'a comfortable gray hoodie, dark wash jeans, and white sneakers',
          'a relaxed-fit flannel shirt over a plain t-shirt, with khaki pants and boots',
          'a simple crewneck sweater, black joggers, and stylish running shoes'
        ], 
        girl: [
          'a light blue denim jacket over a white t-shirt, black leggings, and casual sneakers',
          'an oversized band t-shirt, ripped boyfriend jeans, and combat boots',
          'a cozy knit cardigan, a simple camisole, high-waisted mom jeans, and ankle boots'
        ] 
    },
    { 
        name: 'Formal', 
        neutral: [
            'a classic black tuxedo or an elegant evening gown',
            'a sharp, navy blue suit or a sophisticated cocktail dress',
            'a charcoal gray suit or a shimmering sequined gown',
        ],
        guy: [
          'a classic black tuxedo with a white dress shirt and a black bow tie',
          'a sharp, navy blue three-piece suit with a patterned tie and leather dress shoes',
          'a charcoal gray suit, a crisp light-colored shirt, and polished oxford shoes'
        ], 
        girl: [
          'an elegant floor-length navy blue evening gown with silver accessories',
          'a sophisticated black cocktail dress with a pearl necklace and classic pumps',
          'a shimmering sequined gown with a thigh-high slit and strappy heels'
        ] 
    },
    {
        name: 'Fantasy',
        neutral: [
            'dark leather armor with intricate engravings and a cloak',
            'a rugged ranger outfit with a green tunic and a bow',
            'a wise mage\'s robe adorned with celestial patterns',
        ],
        guy: [
            'dark leather armor with intricate silver engravings, a hooded cloak, and worn leather boots',
            'a rugged ranger outfit with a green tunic, leather bracers, and a longbow slung over the shoulder',
            'a wise wizard\'s robe adorned with celestial patterns, holding a glowing staff'
        ],
        girl: [
            'a flowing green elven dress with golden embroidery, and a delicate silver circlet',
            'a fierce warrior queen in ornate golden armor with a fur-lined cape and a sword at her hip',
            'a mystical sorceress in deep purple robes, with glowing runes on her sleeves'
        ]
    },
    {
        name: 'Sci-Fi',
        neutral: [
            'a sleek, form-fitting black jumpsuit with neon light strips',
            'a cyberpunk mercenary with a worn trench coat and cybernetic enhancements',
            'a starship captain\'s uniform in bold primary colors',
        ],
        guy: [
            'a sleek, form-fitting black jumpsuit with neon blue light strips and futuristic boots',
            'a cyberpunk mercenary with a worn trench coat over an armored vest, and cybernetic enhancements',
            'a starship captain\'s uniform in bold primary colors, looking authoritative and clean'
        ],
        girl: [
            'a silver metallic flight suit with a holographic visor and utility belt',
            'an android in a minimalist white and gray outfit with glowing circuit patterns on the skin',
            'a rebellious space pirate with a leather vest, cargo pants, and a high-tech blaster pistol'
        ]
    },
    { 
        name: 'Beachwear',
        neutral: [
            'stylish board shorts or a vibrant bikini with a sun hat',
            'an open Hawaiian shirt over swim trunks or a one-piece with a sarong',
            'a simple tank top and volley shorts or a crochet cover-up',
        ],
        guy: [
            'blue and white striped board shorts, sunglasses, and flip-flops',
            'an open Hawaiian shirt over swim trunks',
            'a simple tank top, volley shorts, and a bucket hat'
        ], 
        girl: [
            'a vibrant floral bikini with a wide-brimmed sun hat and sandals',
            'a stylish one-piece swimsuit with a sheer sarong tied at the waist',
            'a crochet cover-up over a bright-colored bikini top and bottoms'
        ] 
    },
    { 
        name: 'Vintage',
        neutral: [
            'a 1940s-style tweed suit with a flat cap or a 1950s polka dot swing dress',
            'a 1970s disco-era outfit with bell-bottoms or a 1920s flapper dress',
            'a 1950s greaser look with a leather jacket or a 1960s mod-style mini dress',
        ], 
        guy: [
            'a 1940s-style brown tweed suit with a vest and a flat cap',
            'a 1970s disco-era outfit with bell-bottom pants and a colorful patterned shirt',
            'a 1950s greaser look with a leather jacket, white t-shirt, and cuffed jeans'
        ], 
        girl: [
            'a 1950s polka dot swing dress with a red belt and matching heels',
            'a 1920s flapper dress with sequins, beads, and a feathered headband',
            'a 1960s mod-style mini dress with go-go boots'
        ] 
    },
    { 
        name: 'Sporty',
        neutral: [
            'a basketball jersey and shorts with high-top sneakers or a stylish tennis skirt and top',
            'a complete soccer kit or a matching yoga set',
            'a runner\'s outfit or a trendy athleisure look',
        ],
        guy: [
            'a red basketball jersey and shorts with high-top sneakers',
            'a complete soccer kit with jersey, shorts, and cleats',
            'a runner\'s outfit with a moisture-wicking shirt, athletic shorts, and running shoes'
        ], 
        girl: [
            'a stylish tennis skirt and top with a visor and athletic shoes',
            'a matching yoga set with leggings and a sports bra',
            'a trendy athleisure look with a cropped hoodie and matching sweatpants'
        ] 
    },
    { 
        name: 'Business',
        neutral: [
            'a sharp navy blue business suit with a tie or a professional pencil skirt with a silk blouse',
            'a business casual look with a blazer and chinos or a stylish pantsuit',
            'a turtleneck sweater under a sports coat or a sophisticated sheath dress',
        ],
        guy: [
            'a sharp navy blue business suit with a light blue shirt and a tie',
            'a business casual look with a blazer, chinos, and a button-down shirt',
            'a turtleneck sweater under a tailored sports coat for a modern professional look'
        ], 
        girl: [
            'a professional pencil skirt, a silk blouse, and a tailored blazer',
            'a stylish pantsuit in a bold color with elegant heels',
            'a sophisticated sheath dress with a statement necklace'
        ] 
    },
];

const sceneInspirations = {
    'Locations': [
      { name: 'Neon City', prompt: 'in a vibrant neon city at night' },
      { name: 'Cozy Café', prompt: 'at a cozy, dimly lit coffee shop' },
      { name: 'Sunny Beach', prompt: 'on a sunny beach with turquoise waves' },
      { name: 'Mountain Hike', prompt: 'on a mountain trail with a breathtaking view' },
      { name: 'Music Festival', prompt: 'at a vibrant, crowded music festival' },
      { name: 'Enchanted Forest', prompt: 'in a magical forest with glowing mushrooms' },
      { name: 'Rooftop Bar', prompt: 'at a stylish rooftop bar overlooking the city' },
    ],
    'Camera Shots & Angles': [
      { name: 'Close-up Shot', prompt: 'a dramatic close-up shot' },
      { name: 'Low-angle Shot', prompt: 'a powerful low-angle shot' },
      { name: 'Selfie Style', prompt: 'a fun, casual selfie-style photo' },
      { name: 'Candid Shot', prompt: 'a candid, caught-in-the-moment shot' },
      { name: 'Action Shot', prompt: 'a dynamic action shot with motion blur' },
      { name: 'Wide Shot', prompt: 'an epic wide shot showing the environment' },
    ],
    'Poses & Reactions': [
      { name: 'Laughing', prompt: 'laughing uncontrollably' },
      { name: 'Joyful Surprise', prompt: 'with a look of joyful surprise' },
      { name: 'Sharing a Secret', prompt: 'whispering and sharing a secret' },
      { name: 'Thoughtful Gaze', prompt: 'gazing thoughtfully into the distance' },
      { name: 'Dancing', prompt: 'dancing together joyfully' },
      { name: 'Playful Pose', prompt: 'striking a playful, fun pose' },
    ]
  };

  const expressionInspirations = [
    { name: 'Smiling', prompt: 'a gentle, happy smile' },
    { name: 'Laughing', prompt: 'a joyful, open-mouthed laugh' },
    { name: 'Winking', prompt: 'a playful wink' },
    { name: 'Serious', prompt: 'a serious, thoughtful expression' },
    { name: 'Surprised', prompt: 'a look of mild, pleasant surprise' },
    { name: 'Confident', prompt: 'a confident, self-assured look' },
  ];

const useClickOutside = (ref: React.RefObject<HTMLDivElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const OutfitForm: React.FC<OutfitFormProps> = ({ formMode, gender, setGender, outfit, setOutfit, scene, setScene, expression, setExpression, onSubmit, isLoading, isFaceLocked, faceFidelity, setFaceFidelity }) => {
  const [showOutfitIdeas, setShowOutfitIdeas] = useState(false);
  const [showSceneIdeas, setShowSceneIdeas] = useState(false);
  const [showExpressionIdeas, setShowExpressionIdeas] = useState(false);
  
  const outfitIdeasRef = useRef<HTMLDivElement>(null);
  const sceneIdeasRef = useRef<HTMLDivElement>(null);
  const expressionIdeasRef = useRef<HTMLDivElement>(null);

  useClickOutside(outfitIdeasRef, () => setShowOutfitIdeas(false));
  useClickOutside(sceneIdeasRef, () => setShowSceneIdeas(false));
  useClickOutside(expressionIdeasRef, () => setShowExpressionIdeas(false));

  const handleCategoryClick = (category: OutfitCategory) => {
    let prompts: string[] | undefined;
    if (formMode === 'edit') {
        prompts = category.neutral;
    } else {
        prompts = gender === Gender.GUY ? category.guy : category.girl;
    }
    
    if (prompts && prompts.length > 0) {
      const randomIndex = Math.floor(Math.random() * prompts.length);
      setOutfit(prompts[randomIndex]);
    }
    setShowOutfitIdeas(false);
  };
  
  const handleSceneClick = (prompt: string) => {
    setScene(prevScene => {
      if (prevScene.trim() === '') {
        return prompt;
      }
      return `${prevScene.trim()}, ${prompt}`;
    });
    setShowSceneIdeas(false);
  };

  const handleExpressionClick = (prompt: string) => {
    setExpression(prompt);
    setShowExpressionIdeas(false);
  };

  const getFidelityDescription = (value: number): string => {
    if (value >= 95) {
      return "Maximum Fidelity: Preserves your face with 1:1 accuracy. Best for preventing any changes to you.";
    }
    if (value >= 70) {
      return "High Fidelity: Preserves your face with high accuracy, allowing minor AI adjustments for lighting.";
    }
    if (value >= 30) {
      return "Balanced: Good accuracy. Gives AI freedom to blend lighting and angles for a natural composite image.";
    }
    return "Creative Blending: Prioritizes a seamless image. Gives AI freedom to adjust your face to match the new scene.";
  };

  const step1Label = formMode === 'ai' ? '1. Choose a companion' : '1. Describe your new outfit';
  const step2Label = formMode === 'ai' ? '2. Describe their outfit' : '2. Change the Scene (Location, Pose, Angle)';
  const step3Label = formMode === 'ai' ? '3. Set the Scene (Location, Pose, Angle)' : '3. Change Expression (Optional)';
  const step4Label = '4. Your Face Matching Fidelity';
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-2xl shadow-xl w-full flex flex-col space-y-5">
      {formMode === 'ai' && (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{step1Label}</label>
            <div className="grid grid-cols-2 gap-4">
            <GenderButton label="A Girl" value={Gender.GIRL} currentValue={gender} onClick={setGender} />
            <GenderButton label="A Guy" value={Gender.GUY} currentValue={gender} onClick={setGender} />
            </div>
        </div>
      )}

      <div ref={outfitIdeasRef}>
        <label htmlFor="outfit" className="block text-sm font-medium text-gray-300 mb-2">{formMode === 'ai' ? step2Label : step1Label}</label>
        <div className="relative">
            <textarea
              id="outfit"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-colors"
              placeholder={`e.g., "a black leather jacket, white t-shirt, and dark blue jeans"`}
              value={outfit}
              onChange={(e) => setOutfit(e.target.value)}
              disabled={isLoading}
            />
            <button 
                type="button" 
                onClick={() => setShowOutfitIdeas(!showOutfitIdeas)}
                className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-brand-purple transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple"
                aria-label="Get outfit ideas"
                disabled={isLoading}
            >
                <WandIcon className="w-5 h-5" />
            </button>
            {showOutfitIdeas && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl z-10 py-1">
                    {outfitCategories
                        .filter(category => formMode === 'edit' || !category.for || category.for === gender)
                        .map((category) => (
                            <button
                                key={category.name}
                                type="button"
                                onClick={() => handleCategoryClick(category)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple hover:text-white transition-colors"
                            >
                                {category.name}
                            </button>
                        ))
                    }
                </div>
            )}
        </div>
      </div>
      
      <div ref={sceneIdeasRef}>
        <label htmlFor="scene" className="block text-sm font-medium text-gray-300 mb-2">{formMode === 'ai' ? step3Label : step2Label}</label>
        <div className="relative">
            <textarea
              id="scene"
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-colors"
              placeholder="e.g., 'standing under neon city lights' or 'sitting at a cozy café'"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
              disabled={isLoading}
            />
             <button 
                type="button" 
                onClick={() => setShowSceneIdeas(!showSceneIdeas)}
                className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-brand-purple transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple"
                aria-label="Get scene ideas"
                disabled={isLoading}
            >
                <WandIcon className="w-5 h-5" />
            </button>
            {showSceneIdeas && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl z-10 py-1 overflow-y-auto max-h-64">
                    {Object.entries(sceneInspirations).map(([category, ideas]) => (
                        <div key={category}>
                        <h4 className="px-4 pt-2 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{category}</h4>
                        {ideas.map((idea) => (
                            <button
                            key={idea.name}
                            type="button"
                            onClick={() => handleSceneClick(idea.prompt)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple hover:text-white transition-colors"
                            >
                            {idea.name}
                            </button>
                        ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
      
      {formMode === 'edit' && (
        <div ref={expressionIdeasRef}>
          <label htmlFor="expression" className="block text-sm font-medium text-gray-300 mb-2">{step3Label}</label>
          <div className="relative">
              <textarea
                id="expression"
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-colors"
                placeholder="e.g., 'a big, happy smile'"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                disabled={isLoading}
              />
               <button 
                  type="button" 
                  onClick={() => setShowExpressionIdeas(!showExpressionIdeas)}
                  className="absolute top-2.5 right-2.5 p-1 text-gray-400 hover:text-brand-purple transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-brand-purple"
                  aria-label="Get expression ideas"
                  disabled={isLoading}
              >
                  <WandIcon className="w-5 h-5" />
              </button>
              {showExpressionIdeas && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl z-10 py-1">
                      {expressionInspirations.map((idea) => (
                          <button
                              key={idea.name}
                              type="button"
                              onClick={() => handleExpressionClick(idea.prompt)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-brand-purple hover:text-white transition-colors"
                          >
                              {idea.name}
                          </button>
                      ))}
                  </div>
              )}
          </div>
        </div>
      )}

      {formMode === 'ai' && (
        <div>
            <label htmlFor="fidelity" className="block text-sm font-medium text-gray-300 mb-2">{step4Label}</label>
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
       )}

      {formMode === 'ai' && isFaceLocked && (
        <div className="text-center text-sm text-green-300 bg-green-900/50 p-2 rounded-md -mt-2">
            <p>🔒 Face is locked. Your next generation will edit the current result.</p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={isLoading || !outfit.trim()}
        className="w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Magic
          </>
        )}
      </button>
    </div>
  );
};

export default OutfitForm;
