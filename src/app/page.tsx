import { products } from '@/lib/products';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import { Recommendations } from '@/components/recommendations';

export default function Home() {
  return (
    <div
      className="container mx-auto px-4 py-8"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/premium-photo/seamless-orange-background-with-gold-floral-pattern-word-energize-your-designs-with-v_869042-1306.jpg?semt=ais_hybrid&w=740&q=80')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        borderRadius: 'var(--radius)',
      }}
    >
      <section className="text-center mb-12 rounded-lg p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl font-headline">
          New Arrivals
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Check out the latest collection from Darpan Wears.
        </p>
      </section>

      <section id="all-products" className="rounded-lg p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.8)'}}>
        <h2 className="text-2xl font-bold mb-6 font-headline">All Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <Recommendations />
    </div>
  );
}
