import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types/ecommerce';

const PALETTE_COLORS = [
  { name: 'Warm Cream Latte', hex: '#F2E7DC' },
  { name: 'Artisan Cocoa', hex: '#4A2818' },
  { name: 'Blush Sand', hex: '#EAD9CF' },
  { name: 'Golden Honey', hex: '#E29578' },
  { name: 'Rich Espresso', hex: '#361B0E' },
];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [color, setColor] = useState('#F2E7DC');
  const [iconName, setIconName] = useState('Sparkles');

  const loadCategories = async () => {
    const list = await categoryService.getAll();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
    setColor('#F2E7DC');
    setIconName('Sparkles');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setImageUrl(cat.imageUrl);
    setColor(cat.color);
    setIconName(cat.iconName);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      await categoryService.update(editingCategory.id, {
        name,
        description,
        imageUrl,
        color,
        iconName,
      });
    } else {
      await categoryService.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        imageUrl,
        color,
        iconName,
        displayOrder: categories.length + 1,
      });
    }

    setIsModalOpen(false);
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    await categoryService.delete(id);
    setDeleteConfirmId(null);
    loadCategories();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A6153]/70">Taxonomy</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2818]">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5">
            Organize bakery inventory, curate storefront collections and assign warm palette highlights
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-[2rem] p-5 border border-[#E8D8CC] shadow-sm flex flex-col justify-between hover:border-[#4A2818]/30 transition-all"
          >
            <div>
              {/* Header color swatch + Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-[#E8D8CC] shadow-inner"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-mono text-[11px] font-medium text-[#7A6153]">
                    {cat.color}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-full text-[#4A2818] hover:bg-[#F2E7DC] transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-[#F9F4EE] border border-[#E8D8CC]">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Title & Description */}
              <h3 className="font-serif font-bold text-lg text-[#4A2818] mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-[#7A6153] leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8D8CC]/50 text-[11px] font-serif font-bold text-[#7A6153]/70">
              Collection Slug: <span className="font-mono font-normal">/{cat.slug}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#361B0E]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-lg bg-[#FCFAF7] rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E8D8CC] mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6153]/70">Taxonomy Config</span>
                <h2 className="font-serif text-2xl font-bold text-[#4A2818]">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] hover:bg-[#4A2818] hover:text-[#F9F4EE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Edible Glitters & Lustres"
                  className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                />
              </div>

              {/* Brand Palette Swatch Selection */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-2">
                  Artisan Accent Tone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PALETTE_COLORS.map((p) => {
                    const isSelected = color === p.hex;
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setColor(p.hex)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-[#4A2818] bg-[#F2E7DC] shadow-sm font-serif font-bold text-[#4A2818]'
                            : 'border-[#E8D8CC] bg-white text-[#7A6153] hover:bg-[#FCFAF7]'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-[#4A2818]/20 shrink-0"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-[11px] truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Cover Photo Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for customer storefront..."
                  className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#E8D8CC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E8D8CC] font-serif font-semibold text-xs text-[#7A6153] hover:bg-[#F2E7DC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#361B0E]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FCFAF7] rounded-[2rem] border border-[#E8D8CC] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-lg text-[#4A2818]">
              Delete Category?
            </h3>
            <p className="text-xs text-[#7A6153] leading-relaxed">
              Are you sure you want to remove this category from the store menu?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-[#E8D8CC] text-xs font-serif font-semibold text-[#7A6153]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-serif font-bold shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
