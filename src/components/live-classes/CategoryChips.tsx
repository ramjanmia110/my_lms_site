'use client'

interface CategoryChip {
  id: string
  name: string
  color_hex: string
}

interface Props {
  categories: CategoryChip[]
  selected: string
  onSelect: (id: string) => void
}

export default function CategoryChips({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => onSelect('')}
        className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
        style={{ background: !selected ? '#1fbf7a' : '#0d251c', color: !selected ? '#04231a' : '#8fae9f', border: !selected ? '1px solid #1fbf7a' : '1px solid #1f3a2d' }}>
        All
      </button>
      {categories.map(cat => (
        <button key={cat.id} onClick={() => onSelect(selected === cat.id ? '' : cat.id)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
          style={{
            background: selected === cat.id ? cat.color_hex + '20' : '#0d251c',
            color: selected === cat.id ? cat.color_hex : '#a9c9bb',
            border: selected === cat.id ? `1px solid ${cat.color_hex}` : '1px solid #1f3a2d',
          }}>
          {cat.name}
        </button>
      ))}
    </div>
  )
}
