import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  UploadCloud
} from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { storageService } from '../../services/storageService';
import { useToastStore } from '../../store/toastStore';
import type { Product, Category } from '../../types/ecommerce';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [unit, setUnit] = useState('Piece');

  const loadData = async () => {
    const [p, c] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
    ]);
    setProducts(p);
    setCategories(c);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(250);
    setDiscountPrice(undefined);
    setCategoryId(categories[0]?.id || 'cat-cake-decoration');
    setBrand('NayaKart Select');
    setStock(20);
    setImageUrl('https://content.jdmagicbox.com/v2/comp/thiruvananthapuram/j6/0471px471.x471.190622133608.y4j6/catalogue/bake-n-joy-kazhakuttam-thiruvananthapuram-baking-tool-dealers-85hi5gmdrc.jpg');
    setIsFeatured(false);
    setIsActive(true);
    setUnit('Piece');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price);
    setDiscountPrice(product.discountPrice);
    setCategoryId(product.categoryId);
    setBrand(product.brand || '');
    setStock(product.stock);
    setImageUrl(product.images[0] || '');
    setIsFeatured(product.isFeatured);
    setIsActive(product.isActive);
    setUnit(product.unit || 'Piece');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const previewUrl = await storageService.previewFile(file);
        setImageUrl(previewUrl);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = categories.find((c) => c.id === categoryId)?.name || 'Baking Essentials';

    if (editingProduct) {
      await productService.update(editingProduct.id, {
        name,
        description,
        price,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        categoryId,
        categoryName,
        brand,
        stock,
        images: [imageUrl],
        isFeatured,
        isActive,
        unit,
      });
    } else {
      await productService.create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        price,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        categoryId,
        categoryName,
        brand,
        stock,
        images: [imageUrl],
        isFeatured,
        isActive,
        rating: 5.0,
        reviewsCount: 1,
        unit,
      });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleToggleActive = async (product: Product) => {
    const previousProducts = products;
    const newActive = !product.isActive;

    // 1. Optimistically update local UI state immediately
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isActive: newActive } : p))
    );

    try {
      // 2. Persist to storage/service
      await productService.update(product.id, { isActive: newActive });
    } catch (err) {
      // 3. Roll back on failure with notification
      setProducts(previousProducts);
      console.error('Failed to update product status, rolled back:', err);
    }
  };

  const { showToast } = useToastStore();
  const pendingDeletionsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup pending delete timers on unmount
  useEffect(() => {
    return () => {
      pendingDeletionsRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const handleDeleteProduct = (product: Product) => {
    // 1. Drop confirm dialog: soft-delete immediately from UI
    const originalIndex = products.findIndex((p) => p.id === product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    // 2. Schedule delayed permanent backend delete
    const timer = setTimeout(async () => {
      pendingDeletionsRef.current.delete(product.id);
      try {
        await productService.delete(product.id);
      } catch (err) {
        console.error('Failed to execute permanent delete:', err);
      }
    }, 7000);

    pendingDeletionsRef.current.set(product.id, timer);

    // 3. Show Gmail-style Undo toast for 7 seconds
    showToast(
      `Deleted "${product.name}"`,
      {
        label: 'Undo',
        onClick: () => {
          // Cancel scheduled deletion
          const pendingTimer = pendingDeletionsRef.current.get(product.id);
          if (pendingTimer) {
            clearTimeout(pendingTimer);
            pendingDeletionsRef.current.delete(product.id);
          }
          // Restore product to list
          setProducts((prev) => {
            const nextList = [...prev];
            nextList.splice(originalIndex > -1 ? originalIndex : 0, 0, product);
            return nextList;
          });
          showToast(`Restored "${product.name}"`);
        },
      },
      7000
    );
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#7A6153]/70">Inventory</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A2818]">
            Product Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6153] mt-0.5">
            Manage your artisan supplies, pricing, bakery stock levels, and store visibility
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#4A2818] hover:bg-[#361B0E] text-[#F9F4EE] font-serif font-bold text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Toolbar with Search and Category Filter */}
      <div className="bg-white rounded-[2rem] p-4 border border-[#E8D8CC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or brand..."
            className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-full py-2.5 pl-10 pr-4 text-xs font-medium text-[#4A2818] placeholder-[#7A6153]/50 outline-none focus:border-[#4A2818]"
          />
          <Search className="w-4 h-4 text-[#7A6153]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7A6153] font-semibold shrink-0">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FCFAF7] border border-[#E8D8CC] rounded-full px-4 py-2 text-xs font-semibold text-[#4A2818] outline-none cursor-pointer focus:border-[#4A2818]"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[2rem] border border-[#E8D8CC] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F4EE] border-b border-[#E8D8CC] text-[#7A6153] font-serif font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4 sm:px-6">Product</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Price (INR)</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8D8CC]/50 text-[#4A2818]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FCFAF7] transition-colors">
                  
                  {/* Thumbnail & Name */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-[#E8D8CC] shrink-0 bg-[#F9F4EE]"
                      />
                      <div className="min-w-0 max-w-xs">
                        <div className="font-serif font-bold text-sm text-[#4A2818] truncate">
                          {p.name}
                        </div>
                        {p.brand && (
                          <div className="text-[10px] text-[#7A6153] font-medium">{p.brand}</div>
                        )}
                        {p.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-serif font-bold bg-[#F2E7DC] text-[#4A2818] px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-medium text-[#7A6153]">
                    {p.categoryName}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4">
                    <div className="font-serif font-bold text-sm text-[#4A2818]">
                      ₹{p.discountPrice || p.price}
                    </div>
                    {p.discountPrice && (
                      <div className="text-[10px] text-[#7A6153]/60 line-through">₹{p.price}</div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span className={`font-medium px-2.5 py-1 rounded-full text-[11px] ${
                      p.stock > 10
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : p.stock > 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>

                  {/* Status Toggle (Optimistic Update) */}
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.isActive}
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-95 ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200'
                      }`}
                      title={p.isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                      <span className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                      <span>{p.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-full text-[#4A2818] hover:bg-[#F2E7DC] transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete product (Undo available)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#361B0E]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl bg-[#FCFAF7] rounded-[2.5rem] border border-[#E8D8CC] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8D8CC] mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#7A6153]/70">Inventory Edit</span>
                <h2 className="font-serif text-2xl font-bold text-[#4A2818]">
                  {editingProduct ? 'Edit Product' : 'Add New Baking Supply'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#F2E7DC] flex items-center justify-center text-[#4A2818] hover:bg-[#4A2818] hover:text-[#F9F4EE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belgian Dark Couverture Chocolate (54.5%)"
                  className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Callebaut / Tropelite"
                    className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                  />
                </div>
              </div>

              {/* Price, Discount Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional discount"
                    className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                  />
                </div>
              </div>

              {/* Image Preview & Local File Upload */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Product Image Preview & Upload
                </label>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E8D8CC]">
                  <div className="w-16 h-16 rounded-xl bg-[#F9F4EE] border border-[#E8D8CC] overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7A6153]/40">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL or choose file below"
                      className="w-full bg-[#FCFAF7] border border-[#E8D8CC] rounded-xl px-3 py-1.5 text-xs text-[#4A2818] outline-none"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#4A2818] hover:text-[#361B0E] transition-colors cursor-pointer">
                      <UploadCloud className="w-4 h-4" />
                      <span>Select local image from computer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-serif font-bold text-[#4A2818] mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details on cocoa percentage, nozzle sizes, baking recommendations..."
                  className="w-full bg-white border border-[#E8D8CC] focus:border-[#4A2818] rounded-2xl p-3 text-xs font-medium text-[#4A2818] outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4A2818]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4A2818] accent-[#4A2818]"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#4A2818]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4A2818] accent-[#4A2818]"
                  />
                  <span>Product is Active on Store</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
