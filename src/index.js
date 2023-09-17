import { LANGUAGES, LANGUAGE_MODELS } from "./constants";
import { Translator } from "./translate";
import { sample } from "./sample";

let translated = {};

//test
const model = 'Helsinki-NLP/opus-mt-en-hi';

console.log("--start--");
let translator = new Translator(model);
document.addEventListener('translaterInitialized', (e) => {
    let pre = Object.values(sample);
    const timer = elapsedTimer();
    translator.source = LANGUAGES[translator.model].english;
    translator.target = LANGUAGES[translator.model].hindi;
    translator.translate(pre)
    .then(res => {
        timer();
        console.log(res);
        // translated = {...res};
    })
})

//
const sourceDiv = document.getElementById("translationSource");
const targetDiv = document.getElementById("translationTarget");
const sourceSelector = document.getElementById("sourceLanguage");
const targetSelector = document.getElementById("targetLanguage");
const modelSelector = document.getElementById("modelSelector");

modelSelector.addEventListener('change', (event) => {
    translator = new Translator(event.target.value);
})

function setSelectorValues() {
    for(let key of Object.keys(LANGUAGES[translator.model])) {
        sourceSelector.appendChild(createOptionNode(key,LANGUAGES[translator.model][key]));
        targetSelector.appendChild(createOptionNode(key,LANGUAGES[translator.model][key]));
    }

    for(let model of Object.keys(LANGUAGE_MODELS)) {
        modelSelector.appendChild(createOptionNode(model,LANGUAGE_MODELS[model]));
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
        translator.source = srcLang;
        translator.target = tarLang;
        let timer = elapsedTimer();
        translator.translate(sourceDiv.value)
            .then(data => {
                timer();
                console.log(data);
                targetDiv.value = data[0].translation_text;

            })
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


