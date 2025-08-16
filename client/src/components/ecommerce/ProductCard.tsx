import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart, Eye } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addToCart(product.id, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  const primaryImage = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] as string
    : '/placeholder-product.jpg';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden relative" data-testid={`product-card-${product.id}`}>
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          data-testid={`product-image-${product.id}`}
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="bg-yellow-500 text-yellow-900">Featured</Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive">{discountPercentage}% OFF</Badge>
          )}
          {!product.trackQuantity || (product.stockQuantity && product.stockQuantity > 0) ? null : (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/90 hover:bg-white"
            onClick={() => setIsFavorited(!isFavorited)}
            data-testid={`favorite-button-${product.id}`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          {onQuickView && (
            <Button
              size="sm"
              variant="ghost"
              className="bg-white/90 hover:bg-white"
              onClick={() => onQuickView(product)}
              data-testid={`quick-view-button-${product.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight mb-1" data-testid={`product-name-${product.id}`}>
              {product.name}
            </h3>
            <Badge variant="outline" className="text-xs" data-testid={`product-category-${product.id}`}>
              {product.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2">
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3" data-testid={`product-description-${product.id}`}>
          {product.shortDescription || product.description}
        </p>

        {/* Features */}
        {Array.isArray(product.features) && product.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(product.features as string[]).slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {(product.features as string[]).length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{(product.features as string[]).length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Rating - Placeholder for now */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-600" data-testid={`product-price-${product.id}`}>
            ${Number(product.price).toFixed(2)}
          </span>
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <span className="text-sm text-gray-500 line-through" data-testid={`product-compare-price-${product.id}`}>
              ${Number(product.compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isLoading || (!product.trackQuantity ? false : !product.stockQuantity || product.stockQuantity <= 0)}
          data-testid={`add-to-cart-button-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isLoading ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}