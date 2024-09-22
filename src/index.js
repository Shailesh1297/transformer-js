import { Counter } from "./counter";
import { Downloader } from "./downloader";
import { Flyway } from "./flyway";
import { LanguageCheckList } from "./languageChecklist";
import { LanguageSelector } from "./languageSelector";
import { Modal } from "./modal";
import { Progress } from "./progress";
import { Spinner } from "./spinner";
import { Toast } from "./toast";

let translations = {};
let spinner,toast,modal,progress,worker,languageSelector,targetLanguages;
const translationCounter = new Counter();

//elements
const sourceDiv = document.getElementById("translationSource");
const targetDiv = document.getElementById("translationTarget");
const bundle = document.getElementById("bundle");
const type = document.getElementById("flyway-type");
const translateBtn = document.getElementById("translate-btn");
const userInitial = document.getElementById("user-initial");
const title = document.getElementById("flyway-title");

//title underscore handle
function flywayName() {
  return `V4_${getDateTime()}__${userInitial.value}_${flywayTitle()}`;
}

function flywayTitle() {
  return title.value.replaceAll(' ','_');
}

function getDateTime() {
  const date = new Date();
  return `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2,"0")}${date.getDate().toString().padStart(2,"0")}.${date.getHours().toString().padStart(2,"0")}${date.getMinutes().toString().padStart(2,"0")}`;
}



function modalNegativeCallback(event) {
  console.log("modal closed");
}

function modalPositiveCallback() {
  const downloader = new Downloader(targetDiv.value);
  downloader.download(`${flywayName()}.sql`);
  modal.hide();
}

window.onload = function(){
  languageSelector = new LanguageSelector('sourceLanguage');
  targetLanguages = new LanguageCheckList();
  progress = new Progress();
  toast = new Toast();
  modal = new Modal(modalPositiveCallback,modalNegativeCallback);
  toast.show('Please wait a moment, loading translation model');
  spinner = new Spinner();
  spinner.show();
  initWorker();
}

function initWorker() {
  worker = new Worker("worker/translator.js",{type:'module'});
  worker.onmessage = (event)=> {
    const message = event.data;
    console.log(message);
    if (message.status === 'ready') {
      spinner.hide();
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
        let percent = (100 / progress.maxValue()) + progress.currentValue();
        progress.update(percent);
        translationCounter.decrease();
        if (!translationCounter.count) {
          //last progress item
          percent = (100 / progress.maxValue()) + progress.currentValue();
          progress.update(percent);
          completeTranslation();
        }
      }
    }
  }

  //initialize translation object
  worker.postMessage({type: 'init'});
}


//event listeners
translateBtn.addEventListener('click', (event) => {
    translate();
});

function translate() {
  try {
    const source = JSON.parse(sourceDiv.value);
    //cache input
    localStorage.setItem("source",sourceDiv.value);
    console.log(source);
    if (source !== '') {
        progress.show();
        console.log("--Start Translation--");
        const srcLang = languageSelector.selectedLanguage();
        //reset previous translations
        translations = {};
        translations[srcLang] = source;
      for (let key in source) {
        targetLanguages.values().forEach(tarLang => {
          console.log(srcLang,'--->',tarLang);
          translations[tarLang] = {};
          if (type.value !== 'REMOVE') {
            const obj = { type: 'translate', label: key, text: source[key], sourceLanguage: srcLang, targetLanguage: tarLang };
            worker.postMessage(obj);
            translationCounter.increase();
          } else {
            translations[tarLang] = { ...source };
          }
        });
      }
     progress.setMaxValue(translationCounter.count);
      if (type.value === 'REMOVE') {
        progress.hide();
        const fy = new Flyway(translations);
        const data = fy.createFlyways(type.value, bundle.value);
        targetDiv.value = data;
        modal.show();
      }
    } else {
        targetDiv.value = '';
    }
  } catch(e) {
    toast.show('Please provide JSON value');
    console.log(e);
  }
}

function completeTranslation() {
 //to complete progress rendering
  setTimeout(() => {
    progress.hide();
    const fy = new Flyway(translations);
    const data = fy.createFlyways(type.value,bundle.value);
    targetDiv.value = data;
    modal.show();
  }, 500);
}



