export class Toast {
  constructor() {
    this.toastElement = document.getElementById('toast');
    this.toastContent = document.getElementById('toast-content');
    this.toast = bootstrap.Toast.getOrCreateInstance(this.toastElement);
  }

  show(value) {
    this.toastContent.innerText = value;
    this.toast.show();
  }

  hide(value) {
    this.toastContent.innerText = '';
    this.toast.hide();
  }
}