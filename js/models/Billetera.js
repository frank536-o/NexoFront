export class Billetera {
  constructor(idBilletera, saldoBilletera = 0.0) {
    this.idBilletera = idBilletera;
    this.saldoBilletera = Number(saldoBilletera);
  }
}