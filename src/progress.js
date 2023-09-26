export class Progress {
  constructor() {
    //show/hide
    this.progressBar = document.getElementById('progress-bar');
    //increase/decrease
    this.progress = document.getElementById('progress');
    this.content = document.getElementById("content");
  }

  maxValue() {
    return parseInt(this.progress.ariaValueMax);
  }

  setMaxValue(value) {
    this.progress.ariaValueMax = value;
  }

  currentValue() {
    return parseInt(this.progress.ariaValueNow);
  }

  show() {
    this.content.classList.add('pe-none','blur');
    this.progressBar.classList.remove('d-none');
  }

  hide() {
    this.content.classList.remove('pe-none','blur');
    this.progressBar.classList.add('d-none');
    this.progress.style.width='0';
    this.progress.ariaValueNow = 0;
    this.progress.ariaValueMax = 0;
  }

  update(value) {
    this.progress.style.width=`${value}%`;
    this.progress.ariaValueNow = value;
  }
}