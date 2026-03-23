// E:\guide-digitali\src\components\CategoryFilter.tsx
// Tab filtro categorie con stile neon

'use client';

import { GuideCategory } from '@/lib/guide-types';
import { CATEGORY_CONFIG, ALL_CATEGORIES } from '@/lib/guide-utils';

interface CategoryFilterProps {
  selected: GuideCategory | null;
  onSelect: (category: GuideCategory | null) => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
          selected === null
            ? 'bg-white/10 text-white border-white/20'
            : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
        }`}
      >
        Tutte
      </button>

      {ALL_CATEGORIES.map(cat => {
        const config = CATEGORY_CONFIG[cat];
        const isActive = selected === cat;

        return (
          <button
            key={cat}
            onClick={() => onSelect(isActive ? null : cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              isActive
                ? `${config.bgColor} ${config.textColor} ${config.borderColor}`
                : 'bg-transparent text-gray-500 border-white/5 hover:border-white/10 hover:text-gray-300'
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
