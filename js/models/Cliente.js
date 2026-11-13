import { Usuario } from './Usuario.js';

export class Cliente extends Usuario {
  constructor(data, cantServ = 0) {
    super(data);
    this.cantServ = cantServ;
  }
}