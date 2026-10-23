import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types/ecommerce';

const PALETTE_COLORS = [
  { name: 'Wasabi (Lime Accent)', hex: '#EAF05C' },
  { name: 'Orange Topaze (Action)', hex: '#FF5C34' },
  { name: 'Cool Blue (Secondary)', hex: '#D7EFFF' },
  { name: 'Vert Sauge (Muted Sage)', hex: '#AEBBA0' },
  { name: 'Cassis (Deep Burgundy)', hex: '#351E28' },
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
  const [color, setColor] = useState('#EAF05C');
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
    setColor('#EAF05C');
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
          <h1 className="font-heading font-black text-3xl text-[#351E28]">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-[#351E28]/70 mt-0.5">
            Organize baking inventory, assign brand palette colors and update descriptions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl p-5 border-2 border-[#351E28]/10 shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Header color swatch + Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl border border-[#351E28]/20 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-mono text-[10px] font-bold text-[#351E28]/60">
                    {cat.color}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-[#351E28] hover:bg-[#D7EFFF] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="w-full h-32 rounded-2xl overflow-hidden mb-3 bg-[#F8F7F0] border border-[#351E28]/10">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Description */}
              <h3 className="font-heading font-black text-lg text-[#351E28] mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-[#351E28]/70 leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#351E28]/5 text-[11px] font-semibold text-[#AEBBA0]">
              Slug: /{cat.slug}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-lg bg-white rounded-3xl border-2 border-[#351E28] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#351E28]/10 mb-5">
              <h2 className="font-heading font-black text-2xl text-[#351E28]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F7F0] flex items-center justify-center text-[#351E28] hover:bg-[#351E28] hover:text-[#EAF05C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Edible Glitters & Lustres"
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                />
              </div>

              {/* Brand Palette Swatch Selection as specified in Section 5.D */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-2">
                  Brand Color Swatch (Mandatory Palette)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PALETTE_COLORS.map((p) => {
                    const isSelected = color === p.hex;
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setColor(p.hex)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-[#351E28] bg-white shadow-sm scale-102 font-bold'
                            : 'border-transparent bg-[#F8F7F0] text-[#351E28]/80 hover:bg-white'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-[11px] truncate">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Cover Photo Image URL *
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#351E28] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for customer storefront..."
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#351E28] outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-[#351E28]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-full border border-[#351E28]/20 font-bold text-xs text-[#351E28]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-xs shadow-md transition-all active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#351E28] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-heading font-black text-lg text-[#351E28]">
              Delete Category?
            </h3>
            <p className="text-xs text-[#351E28]/70">
              Are you sure you want to remove this category from the store menu?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-[#351E28]/20 text-xs font-bold text-[#351E28]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
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
