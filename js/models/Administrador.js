import { Usuario } from './Usuario.js';

export class Administrador extends Usuario {
  constructor(data, role = 'ADMIN') {
    super(data);
    this.role = role;
  }
}