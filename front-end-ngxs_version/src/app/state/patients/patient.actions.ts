export namespace PatientActions {
  
  export class LoadAll { 
    static readonly type = '[Patient] Load All'; 
    constructor(public force: boolean = false) {}
  }

  export class LoadById { 
    static readonly type = '[Patient] Load By Id'; 
    constructor(public id: number) {} 
  }
  export class Create   { 
    static readonly type = '[Patient] Create';   
    constructor(public payload: any) {} 
  }

  export class Update   { 
    static readonly type = '[Patient] Update';   
    constructor(public payload: any) {} 
  }

  export class Delete   { 
    static readonly type = '[Patient] Delete';   
    constructor(public id: number) {} 
  }


}
