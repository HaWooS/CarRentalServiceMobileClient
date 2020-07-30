import { Injectable } from "@angular/core";

@Injectable({  providedIn: 'root'})
export class DataList {
  public id: number;
  public user: string;
  public price: number;
  public start_date: string;
  public end_date: string;
  public deposit: number;
  public box_code: number;
  public cost: number;
  public reservationPossibility: boolean;

  constructor() {}

  get getReservationPosibility(): boolean {
      return this.reservationPossibility;
  }

  get getBox_code(): number {
      return this.box_code;
  }

  get getCost() : number{
      return this.cost;
  }

  get getId(): number {
    return this.id;
  }
  get getUser(): string {
  return this.user;
  }
  get getPrice(): number {
      return this.price;
  }
  get getStart_date(): string {
      return this.start_date;
  }
  get getEnd_date(): string {
      return this.end_date;
  }

  get getDeposit() : number {
      return this.deposit;
  }

  set setId(val: number) {
      this.id = val;
  }
  set setUser(val: string) {
      this.user = val;
  }
  set setPrice(val: number) {
      this.price = val;
  }
  set setStart_date(val: string) {
      this.start_date = val;
  }
  set setEnd_date(val: string) {
      this.end_date = val;
  }

  set setDeposit(val: number) {
      this.deposit = val;
  }

  set setBox_code(val: number) {
      this.box_code = val;
  }

  set setCost(val: number) {
      this.cost = val;
  }

  set setReservationPossibility(val: boolean) {
      this.reservationPossibility = val;
}

}
