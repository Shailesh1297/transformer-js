import { LANGUAGES, LANGUAGE_MODELS } from "./constants";
import { Flyway } from "./flyway";
import { Downloader } from "./downloader";

let translations = {};
function counter() {
  let value = 0;
  return {
    count: () => value,
    reset: () => { value = 0 },
    increase: () => ++value,
    decrease: () => --value
  }
}

const translationCounter = counter();

//elements
const sourceDiv = document.getElementById("translationSource");
const targetDiv = document.getElementById("translationTarget");
const sourceSelector = document.getElementById("sourceLanguage");
// const targetSelector = document.getElementById("targetLanguage");
const checkbox_container = document.getElementById("language-options");
const modelSelector = document.getElementById("modelSelector");
const translateBtn = document.getElementById("translate-btn");

//modal
const modalElement = document.getElementById('ui-modal');
const modalPosResBtn = document.getElementById('modal-response-positive');
var modal;

//spinner
const loader = document.getElementById("ui-loader");
const content = document.getElementById("content");

//toast
const toastElement = document.getElementById('toast');
const toastContent = document.getElementById('toast-content');
var toast;

//progress bar
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');

function showProgressBar() {
  content.classList.add('pe-none','blur');
  progressBar.classList.remove('d-none');
}

function hideProgressBar() {
  content.classList.remove('pe-none','blur');
  progressBar.classList.add('d-none');
  progress.style.width='0';
  progress.ariaValueNow = 0;
}

function updateProgressBar(value) {
  progress.style.width=`${value}%`;
  progress.ariaValueNow = value;
}

function showSpinner() {
  content.classList.add('pe-none','blur');
  loader.classList.remove('d-none');
}

function hideSpinner() {
  content.classList.remove('pe-none','blur');
  loader.classList.add('d-none');
}

function showToast(value) {
  toastContent.innerText = value;
  toast.show();
}

function hideToast(value) {
  toastContent.innerText = '';
  toast.hide();
}

window.onload = function(){
  toast = bootstrap.Toast.getOrCreateInstance(toastElement);
  modal = new bootstrap.Modal(modalElement);
  showToast('Please wait a moment, loading translation model');
  showSpinner();
}

const myWorker = new Worker("worker/translator.js",{type:'module'});
myWorker.onmessage = (event)=> {
  const message = event.data;
  console.log(message);
  if (message.status === 'ready') {
    hideSpinner();
    //restoring previous data
    const source = localStorage.getItem('source');
    if(source) {
      sourceDiv.value = source;
    }
  } else {
    if (message.output.label) {
      translations[message.output.language] = {...translations[message.output.language],
        [message.output.label]: message.output.translation[0].translation_text
      }

      //search a solution for progress bar
      let percent = parseInt(progress.ariaValueNow||'0') + parseInt();
      console.log(progress.ariaValueNow);
      updateProgressBar(percent);
      translationCounter.decrease();
      if (!translationCounter.count()) {
          hideProgressBar();
        const fy = new Flyway(translations);
        const data = fy.createFlyways();
        targetDiv.value = data;
        modal.show();
      }
    }

  }
}

// myWorker.postMessage({text: 'Click the button to open modal',sourceLanguage:"eng_Latn",targetLanguage:'hin_Deva'});
myWorker.postMessage({type: 'init'});

//event listeners
translateBtn.addEventListener('click', (event) => {
    translate();
});

modalElement.addEventListener('hidden.bs.modal', function (event) {
  console.log("modal closed");
});

modalPosResBtn.addEventListener('click', () => {
  const downloader = new Downloader(targetDiv.value);
  downloader.download(`labels_${Date.now()}.sql`);
  modal.hide();
})

function setCheckboxValues(){
  const requiredLanguages = [
    {key: "English",value: "eng_Latn"},
    {key: "Hindi", value: "hin_Deva"},
    {key:"Chinese", value: "zho_Hant"},
    {key:"Arabic", value: "ace_Arab"},
    {key:"French", value: "fra_Latn"},
    {key:"Spanish", value: "spa_Latn"},
    {key:"German", value: "deu_Latn"},
    {key:"Dutch", value: "nld_Latn"},
    {key:"Russian", value: "rus_Cyrl"},
    {key:"Bulgarian", value: "bul_Cyrl"},
    {key:"Romanian", value: "ron_Latn"},
    {key:"Portuguese", value: "por_Latn"},
    {key:"Italian", value: "ita_Latn"}
  ];
  requiredLanguages.forEach((options)=>{
      const span = createSpan();
      span.appendChild(createCheckbox(options.value));
      span.appendChild(createLabel(options.key));
      checkbox_container.appendChild(span);
  })
}

function createSpan() {
  const span = document.createElement('span');
  span.classList.add('px-1')
  return span;
}

function createCheckbox(value) {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type','checkbox');
  checkbox.setAttribute('value', value);
  checkbox.classList.add('form-check-input');
  return checkbox;
}

function createLabel(value) {
  const label = document.createElement('label');
    label.classList.add('form-check-label','mx-1')
    label.innerText = value;
    return label;
}



function setSelectorValues() {
  const model = "Xenova/nllb-200-distilled-600M";
    for(let key of Object.keys(LANGUAGES[LANGUAGE_MODELS[model]])) {
        sourceSelector.appendChild(createOptionNode(key,LANGUAGES[model][key]));
        // targetSelector.appendChild(createOptionNode(key,LANGUAGES[model][key]));
    }
}

function createOptionNode(key, value){
    const optionNode = document.createElement('option');
    optionNode.setAttribute('value', value);
    optionNode.innerText = key;
    return optionNode;
}

function elapsedTimer() {
    const startTime = Date.now();
    return function() {
        console.log(`execution time ==> ${(Date.now() - startTime)/1000}s`);
    }
}

function getCheckListValues() {
  const checkboxes = document.querySelectorAll('input[type=checkbox]');
  const checked = [];
  checkboxes.forEach(checkEl =>{
      if(checkEl.checked) {
        checked.push(checkEl.value);
      }
  })
  return checked;
}

function translate() {
  try {
    const source = JSON.parse(sourceDiv.value);
    //refresh resistent
    localStorage.setItem("source",sourceDiv.value);
    console.log(source);
    if (source !== '') {
      const targetLanguages = getCheckListValues();
        showProgressBar();
        console.log("--Start Translation--");
        const srcLang = sourceSelector.value;
        //reset previous translations
        translations = {};
        translations[srcLang] = source;
      for (let key in source) {
        targetLanguages.forEach(tarLang => {
          console.log(srcLang,'--->',tarLang);
          translations[tarLang] = {};
          const obj = { type: 'translate', label: key, text: source[key], sourceLanguage: srcLang, targetLanguage: tarLang };
          myWorker.postMessage(obj);
          translationCounter.increase();
        })

      }
    } else {
        targetDiv.value = '';
    }
  } catch(e) {
    showToast('Please provide JSON value');
    console.log(e);
  }
}

function debounceFunc(func, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply();
        }, delay)
    }
}
const optimizedTranslationHandler = debounceFunc(translate, 3000);

// sourceDiv.addEventListener('keyup', optimizedTranslationHandler);
setSelectorValues();
setCheckboxValues();


