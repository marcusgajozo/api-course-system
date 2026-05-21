export class ResponseDto<T> {
  data: T;

  constructor(data: T) {
    this.data = data;
  }
}
