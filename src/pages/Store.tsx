import { motion } from "framer-motion";
import { ShoppingCart, Download, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { mockProducts, type Product } from "@/lib/medusa";

const categories = ["All", "Comics", "Art Packs", "Lore", "Wallpapers", "Audio"];

export default function Store() {
  const [filter, setFilter] = useState("All");
  const [cart, setCart] = useState<Product[]>([]);

  const products = filter === "All" ? mockProducts : mockProducts.filter(p => p.category === filter);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  const cartTotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="text-primary font-display tracking-[0.3em] mb-2">DIGITAL ARMORY</p>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">CONTENT STORE</h1>
          <p className="text-muted-foreground max-w-xl">
            Comics, art, lore, and soundtracks — all AI-generated, all from the NakeKnight™ universe.
          </p>
        </motion.div>

        {/* Cart indicator */}
        {cart.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <span className="text-foreground font-display">{cart.length} ITEMS — ${cartTotal.toFixed(2)}</span>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground font-display text-sm tracking-wider rounded-sm hover:bg-primary/90 transition-colors">
              CHECKOUT
            </button>
          </motion.div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-4 py-1.5 font-display text-sm tracking-wider rounded-sm transition-colors ${
                filter === c
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                <Sparkles className="w-12 h-12 text-primary/20" />
                {product.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground font-display text-[10px] tracking-widest rounded-sm">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-display text-xl text-foreground leading-tight">{product.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-primary">{product.priceFormatted}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-display text-sm tracking-wider rounded-sm hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    ADD
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-1 text-[10px] text-primary/50">
                  <Bot className="w-3 h-3" /> AI-Generated • Digital Download
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm">
            More content drops every week. All products are AI-generated digital downloads.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
