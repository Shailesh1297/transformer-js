export class Spinner {

  constructor() {
    //spinner
    this.loader = document.getElementById("ui-loader");
    this.content = document.getElementById("content");
  }

  show() {
    this.content.classList.add('pe-none', 'blur');
    this.loader.classList.remove('d-none');
  }

  hide() {
    this.content.classList.remove('pe-none', 'blur');
    this.loader.classList.add('d-none');
  }
}