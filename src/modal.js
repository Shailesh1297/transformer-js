export class Modal {

  constructor(positiveCallback, negativeCallback) {
    //modal
    this.modalElement = document.getElementById('ui-modal');
    this.modalPosResBtn = document.getElementById('modal-response-positive');
    this.modal = new bootstrap.Modal(this.modalElement);
    this.modalElement.addEventListener('hidden.bs.modal', negativeCallback);
    this.modalPosResBtn.addEventListener('click', positiveCallback)
  }

  show() {
    this.modal.show();
  }

  hide() {
    this.modal.hide();
  }
}