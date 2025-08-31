export namespace VisitActions {
  export class LoadAll {
    static readonly type = '[Visit] Load All';
    constructor(public force: boolean = false) {}
  }
  export class LoadById {
    static readonly type = '[Visit] Load By Id';
    constructor(public id: number) {}
  }
  export class Create {
    static readonly type = '[Visit] Create';
    constructor(public payload: any) {}
  }
  export class Update {
    static readonly type = '[Visit] Update';
    constructor(public payload: any) {}
  }
  export class Delete {
    static readonly type = '[Visit] Delete';
    constructor(public id: number) {}
  }
}
