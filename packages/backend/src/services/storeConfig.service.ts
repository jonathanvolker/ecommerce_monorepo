import { StoreConfig } from '../models';
import { IUpdateStoreConfigInput } from '@sexshop/shared';

export class StoreConfigService {
  async get() {
    let config = await StoreConfig.findOne();

    if (!config) {
      config = await StoreConfig.create({
        bankDetails: {
          cbu: '0000000000000000000000',
          alias: 'alias.tienda',
          accountHolder: 'Titular de la Cuenta',
          bankName: 'Banco Ejemplo',
        },
        whatsappNumber: '5491123456789',
        storeName: 'SexySecret',
        pickupInstructions: 'Coordinar retiro por local de lunes a viernes de 10 a 18hs.',
        shippingInstructions: 'El costo de envío se coordina según la distancia.',
      });
    }

    return config;
  }

  async update(input: IUpdateStoreConfigInput) {
    let config = await StoreConfig.findOne();

    if (!config) {
      config = await StoreConfig.create(input);
    } else {
      Object.assign(config, input);
      await config.save();
    }

    return config;
  }
}
