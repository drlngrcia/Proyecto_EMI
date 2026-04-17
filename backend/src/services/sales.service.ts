import { SalesRepository } from '../repositories/sales.repository';
import { CreateSaleDTO } from '../types/sales.types';

export class SalesService {
  private repository: SalesRepository;

  constructor() {
    this.repository = new SalesRepository();
  }

  async getAllSales() {
    return this.repository.findAll();
  }

  async getSaleById(id: string) {
    return this.repository.findById(id);
  }

  async processNewSale(data: CreateSaleDTO) {
    if (!data.items || data.items.length === 0) {
      throw new Error('La venta debe tener al menos un producto');
    }

    // Aquí podríamos validar que haya stock suficiente para cada item antes de vender,
    // o podríamos dejar que el inventario quede negativo y resolverlo. 
    // Depende de la regla de negocio del restaurante. Por ahora lo procesamos como venga.

    return this.repository.createSaleWithTransaction(data);
  }
}
