import { ProductRepository } from '../repositories/product.repository';
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async createProduct(data: CreateProductDTO): Promise<Product> {
    // Aquí podríamos incluir validaciones extra "business logic"
    if (data.min_quantity < 0) {
      throw new Error('La cantidad mínima no puede ser negativa');
    }
    return this.repository.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDTO): Promise<Product | null> {
    if (data.min_quantity !== undefined && data.min_quantity < 0) {
      throw new Error('La cantidad mínima no puede ser negativa');
    }
    const product = await this.repository.update(id, data);
    return product;
  }

  async deactivateProduct(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
