"use client";

import { motion } from "framer-motion";
import { Camera, MapPin, Upload } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import toast from "react-hot-toast";

export default function CreateListingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [images, setImages] = useState<{ file: File, url: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        condition: ''
    });

    const processFiles = (files: FileList | File[]) => {
        const fileArray = Array.from(files).slice(0, 5 - images.length);
        const newImages = fileArray.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemoveImage = (idx: number) => {
        const newImages = [...images];
        URL.revokeObjectURL(newImages[idx].url);
        newImages.splice(idx, 1);
        setImages(newImages);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { toast.error("Please login first"); return; }
        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('condition', formData.condition);
            data.append('ownerId', user.id);
            data.append('ownerName', user.name);
            data.append('ownerAvatar', user.avatar);

            images.forEach((img) => {
                data.append('images', img.file);
            });

            await api.createItem(data);
            toast.success("Item published!");
            router.push("/dashboard");
        } catch (err) {
            console.error("Failed to create item", err);
            toast.error("Failed to create item. Make sure the backend is running.");
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Give an Item</h1>
                <p className="text-muted-foreground">Share details about the item you want to give away to your community.</p>
            </div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 bg-card border rounded-3xl p-6 sm:p-10 shadow-sm"
                onSubmit={handleSubmit}
            >
                {/* Basic Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold border-b pb-2">Basic Details</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Item Title <span className="text-destructive">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Slightly used wooden dining chair"
                            className="w-full px-4 py-2 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description <span className="text-destructive">*</span></label>
                        <textarea
                            name="description"
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the item, any damages, why you are giving it away..."
                            className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer">
                                <option value="">Select a category</option>
                                <option value="furniture">Furniture</option>
                                <option value="electronics">Electronics</option>
                                <option value="clothing">Clothing & Accessories</option>
                                <option value="books">Books & Media</option>
                                <option value="home">Home Goods</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full px-4 py-2.5 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none cursor-pointer">
                                <option value="">Select condition</option>
                                <option value="new">New</option>
                                <option value="like-new">Like New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair (Needs TLC)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Photos Setup */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Photos <span className="text-destructive">*</span></h2>
                    <p className="text-sm text-muted-foreground">Add up to 5 photos showing the item clearly. Include any damages.</p>

                    <div
                        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-2xl border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-transparent'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {images.map((img, idx) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={idx}
                                className="aspect-square rounded-xl bg-muted border overflow-hidden relative group shadow-sm hover:shadow-md transition-all"
                            >
                                <img src={img.url} alt="Upload preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-medium">
                                    Remove
                                </button>
                            </motion.div>
                        ))}

                        {images.length < 5 && (
                            <label className={`aspect-square rounded-xl border-2 border-dashed hover:border-primary/50 hover:bg-secondary/80 flex flex-col items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-foreground ${isDragging ? 'border-primary bg-primary/10' : 'border-primary/20 bg-secondary/30'}`}>
                                <Camera size={28} className="mb-2" />
                                <span className="text-xs font-medium text-center px-2">Drag & Drop or Click</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Location Setup */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Pickup Location</h2>

                    <div className="w-full h-48 bg-secondary rounded-2xl border relative flex flex-col items-center justify-center overflow-hidden">
                        <MapPin size={40} className="text-primary mb-2 z-10" />
                        <p className="text-sm font-medium z-10 px-4 text-center">Use my current location</p>
                        <p className="text-xs text-muted-foreground mt-1 z-10 text-center max-w-xs">We only share rough estimates for privacy. Exact location shown after approval.</p>
                        <div className="absolute inset-0 bg-[#e5e3df] dark:bg-[#262626] opacity-30">
                            {/* Grid Map Placeholder */}
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20 text-foreground">
                                <defs>
                                    <pattern id="gridbg" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#gridbg)" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end gap-4 border-t">
                    <button type="button" className="px-6 py-2.5 rounded-xl border hover:bg-secondary font-medium transition-colors" disabled={loading}>
                        Save Draft
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 flex items-center gap-2 transition-transform active:scale-95 shadow-md disabled:opacity-50">
                        {loading ? 'Publishing...' : 'Publish Item'}
                        <Upload size={18} />
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
