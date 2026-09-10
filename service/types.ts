export namespace API {
  export type GeneralResponse<T> = {
    code: number
    msg: string
    data: T
  }
  export type ErrorResponse = GeneralResponse<null>
}