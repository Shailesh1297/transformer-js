import { LANGUAGES, LANGUAGE_MODELS } from "./constants";

//elements
const sourceDiv = document.getElementById("translationSource");
const targetDiv = document.getElementById("translationTarget");
const sourceSelector = document.getElementById("sourceLanguage");
const targetSelector = document.getElementById("targetLanguage");
const modelSelector = document.getElementById("modelSelector");
const loader = document.getElementById("ui-loader");
const content = document.getElementById("content");

function showSpinner() {
  content.classList.add('pe-none','blur');
  loader.classList.remove('d-none');
}

function hideSpinner() {
  content.classList.remove('pe-none','blur');
  loader.classList.add('d-none');
}

window.onload = function(){
   showSpinner();
}

const myWorker = new Worker("worker/translator.js",{type:'module'});
myWorker.onmessage = (event)=> {
  const message = event.data;
  console.log(message);
  if (message.status === 'ready') {
    hideSpinner();
  } else {
    targetDiv.value = message.output[0].translation_text;
  }
}

myWorker.postMessage({text: 'Click the button to open modal',sourceLanguage:"eng_Latn",targetLanguage:'hin_Deva'});




modelSelector.addEventListener('change', (event) => {
    // translator = new Translator(event.target.value);
})



function setSelectorValues() {
  const model = "Xenova/nllb-200-distilled-600M";
    for(let key of Object.keys(LANGUAGES[LANGUAGE_MODELS[model]])) {
        sourceSelector.appendChild(createOptionNode(key,LANGUAGES[model][key]));
        targetSelector.appendChild(createOptionNode(key,LANGUAGES[model][key]));
    }

    for(let lmodel of Object.keys(LANGUAGE_MODELS)) {
        modelSelector.appendChild(createOptionNode(lmodel,LANGUAGE_MODELS[lmodel]));
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

function translate() {
    const source = sourceDiv.value;
    if (source !== '') {
        console.log("--Start Translation--");
        const srcLang = sourceSelector.value;
        const tarLang = targetSelector.value;
        console.log(srcLang,'--->',tarLang);
        myWorker.postMessage({text: source,sourceLanguage: srcLang, targetLanguage: tarLang});
    } else {
        targetDiv.value = '';
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

sourceDiv.addEventListener('keyup', optimizedTranslationHandler);
setSelectorValues();


