export namespace DoctorActions {
  export class LoadAll { static readonly type = '[Doctor] Load All'; constructor(public force: boolean = false) {} }
  export class LoadById { static readonly type = '[Doctor] Load By Id'; constructor(public id: number) {} }
  export class Create   { static readonly type = '[Doctor] Create';   constructor(public payload: any) {} }
  export class Update   { static readonly type = '[Doctor] Update';   constructor(public payload: any) {} }
  export class Delete   { static readonly type = '[Doctor] Delete';   constructor(public id: number) {} }
}
