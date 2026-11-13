export class Usuario {
  constructor({ id, docType, name, lastName, phone, email, address, password, birthDay, billetera = null }) {
    this.id = id;
    this.docType = docType;
    this.name = name;
    this.lastName = lastName;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.password = password;
    this.birthDay = birthDay;
    this.billetera = billetera;
  }
}
