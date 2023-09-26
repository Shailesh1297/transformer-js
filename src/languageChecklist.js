import { MSB_LANGUAGES } from "./constants";

export class LanguageCheckList {

  constructor() {
    this.checkbox_container = document.getElementById("language-options");
    this.setOptions();
  }

  values() {
    const checkboxes = document.querySelectorAll('input[type=checkbox]');
    const checked = [];
    checkboxes.forEach(checkEl =>{
        if(checkEl.checked) {
          checked.push(checkEl.value);
        }
    })
    return checked;
  }

  setOptions(){
    MSB_LANGUAGES.forEach((options)=>{
        const span = this.createSpan();
        span.appendChild(this.createCheckbox(options.value));
        span.appendChild(this.createLabel(options.key));
        this.checkbox_container.appendChild(span);
    });
  }

  createSpan() {
    const span = document.createElement('span');
    span.classList.add('px-1')
    return span;
  }

  createCheckbox(value) {
    const checkbox = document.createElement('input');
    checkbox.setAttribute('type','checkbox');
    checkbox.setAttribute('value', value);
    checkbox.classList.add('form-check-input');
    return checkbox;
  }

  createLabel(value) {
    const label = document.createElement('label');
      label.classList.add('form-check-label','mx-1')
      label.innerText = value;
      return label;
  }
}