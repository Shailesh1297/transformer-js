import { LANGUAGES, LANGUAGE_MODELS } from "./constants";

export class LanguageSelector {
  constructor(id) {
    this.selector = document.getElementById(id);
    this.setSelectorValues();
  }

  setSelectorValues() {
    const model = "Xenova/nllb-200-distilled-600M";
    for (let key of Object.keys(LANGUAGES[LANGUAGE_MODELS[model]])) {
      this.selector.appendChild(this.createOptionNode(key, LANGUAGES[model][key]));
    }
  }

  createOptionNode(key, value) {
    const optionNode = document.createElement('option');
    optionNode.setAttribute('value', value);
    optionNode.innerText = key;
    if (key === 'English') {
      optionNode.setAttribute('selected', true);
    }
    return optionNode;
  }

  selectedLanguage() {
    return this.selector.value;
  }
}