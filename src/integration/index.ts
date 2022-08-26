export type Obj<T = unknown> = { [key: string]: T };
export type Obj2<T = unknown> = Obj<Obj<T>>;

export const isObj = (v: unknown): v is Obj => true;
