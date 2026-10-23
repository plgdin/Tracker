import React, { useState, useEffect } from 'react';
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
import type { Product, Category } from '../../types/ecommerce';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    setBrand('Bake & Joy Select');
    setStock(20);
    setImageUrl('https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80');
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

  const handleDeleteProduct = async (id: string) => {
    await productService.delete(id);
    setDeleteConfirmId(null);
    loadData();
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
          <h1 className="font-heading font-black text-3xl text-[#351E28]">
            Product Catalogue Management
          </h1>
          <p className="text-xs sm:text-sm text-[#351E28]/70 mt-0.5">
            Add, update pricing, manage stock and toggle active visibility
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF5C34] hover:bg-[#e44c26] text-white font-heading font-black text-xs shadow-md transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Toolbar with Search and Category Filter */}
      <div className="bg-white rounded-3xl p-4 border-2 border-[#351E28]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name or brand..."
            className="w-full bg-[#F8F7F0] border border-[#351E28]/15 rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold text-[#351E28] outline-none focus:border-[#FF5C34]"
          />
          <Search className="w-4 h-4 text-[#351E28]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#351E28]/60 font-bold shrink-0">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F8F7F0] border border-[#351E28]/15 rounded-xl px-3 py-2 text-xs font-bold text-[#351E28] outline-none"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border-2 border-[#351E28]/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F0] border-b border-[#351E28]/10 text-[#351E28]/70 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (INR)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#351E28]/5 text-[#351E28]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F7F0]/60 transition-colors">
                  
                  {/* Thumbnail & Name */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#351E28]/10 shrink-0 bg-[#F8F7F0]"
                      />
                      <div className="min-w-0 max-w-xs">
                        <div className="font-heading font-black text-xs sm:text-sm text-[#351E28] truncate">
                          {p.name}
                        </div>
                        {p.brand && (
                          <div className="text-[10px] text-[#351E28]/50 font-semibold">{p.brand}</div>
                        )}
                        {p.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-[#EAF05C] text-[#351E28] px-1.5 py-0.2 rounded-md uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 font-semibold text-[#351E28]/70">
                    {p.categoryName}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4">
                    <div className="font-heading font-black text-sm text-[#351E28]">
                      ₹{p.discountPrice || p.price}
                    </div>
                    {p.discountPrice && (
                      <div className="text-[10px] text-[#351E28]/40 line-through">₹{p.price}</div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      p.stock > 10
                        ? 'bg-emerald-50 text-emerald-700'
                        : p.stock > 0
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {p.stock} units
                    </span>
                  </td>

                  {/* Status Toggle */}
                  <td className="py-3.5 px-4">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-1.5 ${
                      p.isActive ? 'bg-emerald-500' : 'bg-gray-400'
                    }`} />
                    <span className="font-bold text-[11px]">
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-xl text-[#351E28] hover:bg-[#D7EFFF] transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl border-2 border-[#351E28] shadow-2xl p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#351E28]/10 mb-5">
              <h2 className="font-heading font-black text-2xl text-[#351E28]">
                {editingProduct ? 'Edit Product' : 'Add New Baking Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F8F7F0] flex items-center justify-center text-[#351E28] hover:bg-[#351E28] hover:text-[#EAF05C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Belgian Dark Couverture Chocolate (54.5%)"
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                />
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Callebaut / Tropelite"
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                  />
                </div>
              </div>

              {/* Price, Discount Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                    Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional discount"
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-bold text-[#351E28] outline-none"
                  />
                </div>
              </div>

              {/* Image Preview & Local File Upload (Section 5.C) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Product Image Preview & Upload
                </label>
                <div className="flex items-center gap-4 p-4 bg-[#F8F7F0] rounded-2xl border-2 border-[#351E28]/10">
                  <div className="w-16 h-16 rounded-xl bg-white border border-[#351E28]/20 overflow-hidden shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#351E28]/40">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Paste image URL or choose file below"
                      className="w-full bg-white border border-[#351E28]/15 rounded-xl px-3 py-1.5 text-xs text-[#351E28] outline-none"
                    />
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5C34] hover:text-[#e44c26] transition-colors cursor-pointer">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#351E28]/70 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter details on cocoa percentage, nozzle sizes, baking recommendations..."
                  className="w-full bg-[#F8F7F0] border-2 border-[#351E28]/10 focus:border-[#FF5C34] focus:bg-white rounded-2xl p-3 text-xs font-medium text-[#351E28] outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#351E28]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF5C34] accent-[#FF5C34]"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#351E28]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FF5C34] accent-[#FF5C34]"
                  />
                  <span>Product is Active on Store</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#351E28]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#351E28] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-heading font-black text-lg text-[#351E28]">
              Confirm Product Deletion
            </h3>
            <p className="text-xs text-[#351E28]/70 leading-relaxed">
              Are you sure you want to remove this product from the mock store database?
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-full border border-[#351E28]/20 text-xs font-bold text-[#351E28]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
