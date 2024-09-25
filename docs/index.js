(() => {
  // src/counter.js
  var Counter = class {
    constructor() {
      this.value = 0;
    }
    get count() {
      return this.value;
    }
    reset() {
      this.value = 0;
    }
    increase() {
      return ++this.value;
    }
    decrease() {
      return --this.value;
    }
  };

  // src/downloader.js
  var Downloader = class {
    constructor(content) {
      this.content = content;
    }
    download(filename) {
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.content));
      element.setAttribute("download", filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // src/sqlBuilder.js
  var SqlBuilder = class {
    skeleton = {
      prefix: "UPDATE msb_config SET configuration = JSON_{type}(configuration,",
      content: "",
      suffix: ") WHERE configType = 'LOCALE_MESSAGES_CONFIG' AND JSON_EXTRACT(configuration, '$.key') = 'msb_{module}' AND JSON_EXTRACT(configuration, '$.locale') = '{language}';"
    };
    constructor(type2 = "UPDATE", module = "common", language = "EN") {
      this.type = type2;
      if (type2 !== "CREATE") {
        this.skeleton.prefix = this.inject(this.skeleton.prefix, { type: type2 == "UPDATE" ? "SET" : "REMOVE" });
        this.skeleton.suffix = this.inject(this.skeleton.suffix, { module, language });
      } else {
        this.newBundle(module, language);
      }
    }
    build() {
      return `${this.skeleton.prefix} ${this.skeleton.content} ${this.skeleton.suffix}`;
    }
    addLabelValue(label, value, separator = false) {
      let modLabel = "";
      switch (this.type) {
        case "CREATE":
          modLabel = `"${label}":"${value}" ${separator ? "," : ""}`;
          break;
        case "REMOVE":
          modLabel = `'$.bundle.${label}'${separator ? "," : ""}`;
          break;
        default:
          modLabel = `'$.bundle.${label}',"${value}"${separator ? "," : ""}`;
      }
      this.skeleton.content += modLabel;
    }
    newBundle(module, language) {
      this.skeleton.prefix = this.inject(`call proc_add_config_row("LOCALE_MESSAGES_CONFIG", '{ "key": "msb_{module}","bundle": {`, { module });
      this.skeleton.suffix = this.inject(`},"locale": "{language}" }', "ENABLED");`, { language });
    }
    //injection
    inject(template, placeHolders) {
      let exp, placeHolder;
      for (placeHolder in placeHolders) {
        exp = new RegExp(`{${placeHolder}}`, "i");
        template = template.replace(exp, placeHolders[placeHolder]);
      }
      return template;
    }
  };

  // src/flyway.js
  var Flyway = class {
    languageLocaleMap = {
      "eng_Latn": "EN",
      "hin_Deva": "HI",
      "zho_Hant": "ZH",
      "ace_Arab": "AR",
      "fra_Latn": "FR",
      "spa_Latn": "ES",
      "deu_Latn": "DE",
      "nld_Latn": "NL",
      "rus_Cyrl": "RU",
      "bul_Cyrl": "BG",
      "ron_Latn": "RO",
      "por_Latn": "PT",
      "ita_Latn": "IT"
    };
    constructor(translations2) {
      this.translations = translations2;
    }
    createFlyways(type2 = "UPDATE", bundle2 = "common") {
      console.log(type2, "-->", bundle2);
      let data = "";
      Object.keys(this.translations).forEach((lkey) => {
        const sqlBuilder = new SqlBuilder(type2, bundle2, this.languageLocaleMap[lkey]);
        const labelValueObj = this.translations[lkey];
        Object.keys(labelValueObj).forEach((lbl, idx, lvoKeys) => {
          sqlBuilder.addLabelValue(lbl, labelValueObj[lbl], lvoKeys.length != idx + 1);
        });
        data += `${sqlBuilder.build()}
`;
      });
      return data;
    }
  };

  // src/constants.js
  var LANGUAGES = {
    "Xenova/m2m100_418M": {
      english: "en",
      hindi: "hi",
      french: "fr",
      chinese: "zh",
      arabic: "ar"
    },
    "Xenova/nllb-200-distilled-600M": {
      "Acehnese (Arabic script)": "ace_Arab",
      "Acehnese (Latin script)": "ace_Latn",
      "Afrikaans": "afr_Latn",
      "Akan": "aka_Latn",
      "Amharic": "amh_Ethi",
      "Armenian": "hye_Armn",
      "Assamese": "asm_Beng",
      "Asturian": "ast_Latn",
      "Awadhi": "awa_Deva",
      "Ayacucho Quechua": "quy_Latn",
      "Balinese": "ban_Latn",
      "Bambara": "bam_Latn",
      "Banjar (Arabic script)": "bjn_Arab",
      "Banjar (Latin script)": "bjn_Latn",
      "Bashkir": "bak_Cyrl",
      "Basque": "eus_Latn",
      "Belarusian": "bel_Cyrl",
      "Bemba": "bem_Latn",
      "Bengali": "ben_Beng",
      "Bhojpuri": "bho_Deva",
      "Bosnian": "bos_Latn",
      "Buginese": "bug_Latn",
      "Bulgarian": "bul_Cyrl",
      "Burmese": "mya_Mymr",
      "Catalan": "cat_Latn",
      "Cebuano": "ceb_Latn",
      "Central Atlas Tamazight": "tzm_Tfng",
      "Central Aymara": "ayr_Latn",
      "Central Kanuri (Arabic script)": "knc_Arab",
      "Central Kanuri (Latin script)": "knc_Latn",
      "Central Kurdish": "ckb_Arab",
      "Chhattisgarhi": "hne_Deva",
      "Chinese (Simplified)": "zho_Hans",
      "Chinese (Traditional)": "zho_Hant",
      "Chokwe": "cjk_Latn",
      "Crimean Tatar": "crh_Latn",
      "Croatian": "hrv_Latn",
      "Czech": "ces_Latn",
      "Danish": "dan_Latn",
      "Dari": "prs_Arab",
      "Dutch": "nld_Latn",
      "Dyula": "dyu_Latn",
      "Dzongkha": "dzo_Tibt",
      "Eastern Panjabi": "pan_Guru",
      "Eastern Yiddish": "ydd_Hebr",
      "Egyptian Arabic": "arz_Arab",
      "English": "eng_Latn",
      "Esperanto": "epo_Latn",
      "Estonian": "est_Latn",
      "Ewe": "ewe_Latn",
      "Faroese": "fao_Latn",
      "Fijian": "fij_Latn",
      "Finnish": "fin_Latn",
      "Fon": "fon_Latn",
      "French": "fra_Latn",
      "Friulian": "fur_Latn",
      "Galician": "glg_Latn",
      "Ganda": "lug_Latn",
      "Georgian": "kat_Geor",
      "German": "deu_Latn",
      "Greek": "ell_Grek",
      "Guarani": "grn_Latn",
      "Gujarati": "guj_Gujr",
      "Haitian Creole": "hat_Latn",
      "Halh Mongolian": "khk_Cyrl",
      "Hausa": "hau_Latn",
      "Hebrew": "heb_Hebr",
      "Hindi": "hin_Deva",
      "Hungarian": "hun_Latn",
      "Icelandic": "isl_Latn",
      "Igbo": "ibo_Latn",
      "Ilocano": "ilo_Latn",
      "Indonesian": "ind_Latn",
      "Irish": "gle_Latn",
      "Italian": "ita_Latn",
      "Japanese": "jpn_Jpan",
      "Javanese": "jav_Latn",
      "Jingpho": "kac_Latn",
      "Kabiy\xE8": "kbp_Latn",
      "Kabuverdianu": "kea_Latn",
      "Kabyle": "kab_Latn",
      "Kamba": "kam_Latn",
      "Kannada": "kan_Knda",
      "Kashmiri (Arabic script)": "kas_Arab",
      "Kashmiri (Devanagari script)": "kas_Deva",
      "Kazakh": "kaz_Cyrl",
      "Khmer": "khm_Khmr",
      "Kikongo": "kon_Latn",
      "Kikuyu": "kik_Latn",
      "Kimbundu": "kmb_Latn",
      "Kinyarwanda": "kin_Latn",
      "Korean": "kor_Hang",
      "Kyrgyz": "kir_Cyrl",
      "Lao": "lao_Laoo",
      "Latgalian": "ltg_Latn",
      "Ligurian": "lij_Latn",
      "Limburgish": "lim_Latn",
      "Lingala": "lin_Latn",
      "Lithuanian": "lit_Latn",
      "Lombard": "lmo_Latn",
      "Luba-Kasai": "lua_Latn",
      "Luo": "luo_Latn",
      "Luxembourgish": "ltz_Latn",
      "Macedonian": "mkd_Cyrl",
      "Magahi": "mag_Deva",
      "Maithili": "mai_Deva",
      "Malayalam": "mal_Mlym",
      "Maltese": "mlt_Latn",
      "Maori": "mri_Latn",
      "Marathi": "mar_Deva",
      "Meitei (Bengali script)": "mni_Beng",
      "Mesopotamian Arabic": "acm_Arab",
      "Minangkabau (Arabic script)": "min_Arab",
      "Minangkabau (Latin script)": "min_Latn",
      "Mizo": "lus_Latn",
      "Modern Standard Arabic (Romanized)": "arb_Latn",
      "Modern Standard Arabic": "arb_Arab",
      "Moroccan Arabic": "ary_Arab",
      "Mossi": "mos_Latn",
      "Najdi Arabic": "ars_Arab",
      "Nepali": "npi_Deva",
      "Nigerian Fulfulde": "fuv_Latn",
      "North Azerbaijani": "azj_Latn",
      "North Levantine Arabic": "apc_Arab",
      "Northern Kurdish": "kmr_Latn",
      "Northern Sotho": "nso_Latn",
      "Northern Uzbek": "uzn_Latn",
      "Norwegian Bokm\xE5l": "nob_Latn",
      "Norwegian Nynorsk": "nno_Latn",
      "Nuer": "nus_Latn",
      "Nyanja": "nya_Latn",
      "Occitan": "oci_Latn",
      "Odia": "ory_Orya",
      "Pangasinan": "pag_Latn",
      "Papiamento": "pap_Latn",
      "Plateau Malagasy": "plt_Latn",
      "Polish": "pol_Latn",
      "Portuguese": "por_Latn",
      "Romanian": "ron_Latn",
      "Rundi": "run_Latn",
      "Russian": "rus_Cyrl",
      "Samoan": "smo_Latn",
      "Sango": "sag_Latn",
      "Sanskrit": "san_Deva",
      "Santali": "sat_Olck",
      "Sardinian": "srd_Latn",
      "Scottish Gaelic": "gla_Latn",
      "Serbian": "srp_Cyrl",
      "Shan": "shn_Mymr",
      "Shona": "sna_Latn",
      "Sicilian": "scn_Latn",
      "Silesian": "szl_Latn",
      "Sindhi": "snd_Arab",
      "Sinhala": "sin_Sinh",
      "Slovak": "slk_Latn",
      "Slovenian": "slv_Latn",
      "Somali": "som_Latn",
      "South Azerbaijani": "azb_Arab",
      "South Levantine Arabic": "ajp_Arab",
      "Southern Pashto": "pbt_Arab",
      "Southern Sotho": "sot_Latn",
      "Southwestern Dinka": "dik_Latn",
      "Spanish": "spa_Latn",
      "Standard Latvian": "lvs_Latn",
      "Standard Malay": "zsm_Latn",
      "Standard Tibetan": "bod_Tibt",
      "Sundanese": "sun_Latn",
      "Swahili": "swh_Latn",
      "Swati": "ssw_Latn",
      "Swedish": "swe_Latn",
      "Tagalog": "tgl_Latn",
      "Tajik": "tgk_Cyrl",
      "Tamasheq (Latin script)": "taq_Latn",
      "Tamasheq (Tifinagh script)": "taq_Tfng",
      "Tamil": "tam_Taml",
      "Tatar": "tat_Cyrl",
      "Ta\u2019izzi-Adeni Arabic": "acq_Arab",
      "Telugu": "tel_Telu",
      "Thai": "tha_Thai",
      "Tigrinya": "tir_Ethi",
      "Tok Pisin": "tpi_Latn",
      "Tosk Albanian": "als_Latn",
      "Tsonga": "tso_Latn",
      "Tswana": "tsn_Latn",
      "Tumbuka": "tum_Latn",
      "Tunisian Arabic": "aeb_Arab",
      "Turkish": "tur_Latn",
      "Turkmen": "tuk_Latn",
      "Twi": "twi_Latn",
      "Ukrainian": "ukr_Cyrl",
      "Umbundu": "umb_Latn",
      "Urdu": "urd_Arab",
      "Uyghur": "uig_Arab",
      "Venetian": "vec_Latn",
      "Vietnamese": "vie_Latn",
      "Waray": "war_Latn",
      "Welsh": "cym_Latn",
      "West Central Oromo": "gaz_Latn",
      "Western Persian": "pes_Arab",
      "Wolof": "wol_Latn",
      "Xhosa": "xho_Latn",
      "Yoruba": "yor_Latn",
      "Yue Chinese": "yue_Hant",
      "Zulu": "zul_Latn"
    },
    "Helsinki-NLP/opus-mt-en-hi": {
      english: "eng",
      hindi: "hin"
    }
  };
  var LANGUAGE_MODELS = {
    "Xenova/m2m100_418M": "Xenova/m2m100_418M",
    "Xenova/nllb-200-distilled-600M": "Xenova/nllb-200-distilled-600M",
    "Xenova/mbart-large-50-many-to-many-mmt": "Xenova/mbart-large-50-many-to-many-mmt",
    "Helsinki-NLP/opus-mt-en-hi": "Helsinki-NLP/opus-mt-en-hi"
  };
  var MSB_LANGUAGES = [
    // {key: "English",value: "eng_Latn"},
    { key: "Hindi", value: "hin_Deva" },
    { key: "Chinese", value: "zho_Hant" },
    { key: "Arabic", value: "ace_Arab" },
    { key: "French", value: "fra_Latn" },
    { key: "Spanish", value: "spa_Latn" },
    { key: "German", value: "deu_Latn" },
    { key: "Dutch", value: "nld_Latn" },
    { key: "Russian", value: "rus_Cyrl" },
    { key: "Bulgarian", value: "bul_Cyrl" },
    { key: "Romanian", value: "ron_Latn" },
    { key: "Portuguese", value: "por_Latn" },
    { key: "Italian", value: "ita_Latn" }
  ];

  // src/languageChecklist.js
  var LanguageCheckList = class {
    constructor() {
      this.checkbox_container = document.getElementById("language-options");
      this.setOptions();
    }
    values() {
      const checkboxes = document.querySelectorAll("input[type=checkbox]");
      const checked = [];
      checkboxes.forEach((checkEl) => {
        if (checkEl.checked) {
          checked.push(checkEl.value);
        }
      });
      return checked;
    }
    setOptions() {
      MSB_LANGUAGES.forEach((options) => {
        const span = this.createSpan();
        span.appendChild(this.createCheckbox(options.value));
        span.appendChild(this.createLabel(options.key));
        this.checkbox_container.appendChild(span);
      });
    }
    createSpan() {
      const span = document.createElement("span");
      span.classList.add("px-1");
      return span;
    }
    createCheckbox(value) {
      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("value", value);
      checkbox.classList.add("form-check-input");
      return checkbox;
    }
    createLabel(value) {
      const label = document.createElement("label");
      label.classList.add("form-check-label", "mx-1");
      label.innerText = value;
      return label;
    }
  };

  // src/languageSelector.js
  var LanguageSelector = class {
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
      const optionNode = document.createElement("option");
      optionNode.setAttribute("value", value);
      optionNode.innerText = key;
      if (key === "English") {
        optionNode.setAttribute("selected", true);
      }
      return optionNode;
    }
    selectedLanguage() {
      return this.selector.value;
    }
  };

  // src/modal.js
  var Modal = class {
    constructor(positiveCallback, negativeCallback) {
      this.modalElement = document.getElementById("ui-modal");
      this.modalPosResBtn = document.getElementById("modal-response-positive");
      this.modal = new bootstrap.Modal(this.modalElement);
      this.modalElement.addEventListener("hidden.bs.modal", negativeCallback);
      this.modalPosResBtn.addEventListener("click", positiveCallback);
    }
    show() {
      this.modal.show();
    }
    hide() {
      this.modal.hide();
    }
  };

  // src/progress.js
  var Progress = class {
    constructor() {
      this.progressBar = document.getElementById("progress-bar");
      this.progress = document.getElementById("progress");
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
      this.content.classList.add("pe-none", "blur");
      this.progressBar.classList.remove("d-none");
    }
    hide() {
      this.content.classList.remove("pe-none", "blur");
      this.progressBar.classList.add("d-none");
      this.progress.style.width = "0";
      this.progress.ariaValueNow = 0;
      this.progress.ariaValueMax = 0;
    }
    update(value) {
      this.progress.style.width = `${value}%`;
      this.progress.ariaValueNow = value;
    }
  };

  // src/spinner.js
  var Spinner = class {
    constructor() {
      this.loader = document.getElementById("ui-loader");
      this.content = document.getElementById("content");
    }
    show() {
      this.content.classList.add("pe-none", "blur");
      this.loader.classList.remove("d-none");
    }
    hide() {
      this.content.classList.remove("pe-none", "blur");
      this.loader.classList.add("d-none");
    }
  };

  // src/toast.js
  var Toast = class {
    constructor() {
      this.toastElement = document.getElementById("toast");
      this.toastContent = document.getElementById("toast-content");
      this.toast = bootstrap.Toast.getOrCreateInstance(this.toastElement);
    }
    show(value) {
      this.toastContent.innerText = value;
      this.toast.show();
    }
    hide(value) {
      this.toastContent.innerText = "";
      this.toast.hide();
    }
  };

  // src/index.js
  var translations = {};
  var spinner;
  var toast;
  var modal;
  var progress;
  var worker;
  var languageSelector;
  var targetLanguages;
  var translationCounter = new Counter();
  var sourceDiv = document.getElementById("translationSource");
  var targetDiv = document.getElementById("translationTarget");
  var bundle = document.getElementById("bundle");
  var type = document.getElementById("flyway-type");
  var translateBtn = document.getElementById("translate-btn");
  var userInitial = document.getElementById("user-initial");
  var title = document.getElementById("flyway-title");
  function flywayName() {
    return `V4_${getDateTime()}__${userInitial.value}_${flywayTitle()}`;
  }
  function flywayTitle() {
    return title.value.replaceAll(" ", "_");
  }
  function getDateTime() {
    const date = /* @__PURE__ */ new Date();
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}.${date.getHours().toString().padStart(2, "0")}${date.getMinutes().toString().padStart(2, "0")}`;
  }
  function modalNegativeCallback(event) {
    console.log("modal closed");
  }
  function modalPositiveCallback() {
    const downloader = new Downloader(targetDiv.value);
    downloader.download(`${flywayName()}.sql`);
    modal.hide();
  }
  window.onload = function() {
    languageSelector = new LanguageSelector("sourceLanguage");
    targetLanguages = new LanguageCheckList();
    progress = new Progress();
    toast = new Toast();
    modal = new Modal(modalPositiveCallback, modalNegativeCallback);
    toast.show("Please wait a moment, loading translation model");
    spinner = new Spinner();
    spinner.show();
    initWorker();
    document.getElementById("selectAllLang").addEventListener("click", toggleAllLanguages);
  };
  function initWorker() {
    worker = new Worker("worker/translator.js", { type: "module" });
    worker.onmessage = (event) => {
      const message = event.data;
      console.log(message);
      if (message.status === "ready") {
        spinner.hide();
        const source = localStorage.getItem("source");
        if (source) {
          sourceDiv.value = source;
        }
      } else {
        if (message.output.label) {
          translations[message.output.language] = {
            ...translations[message.output.language],
            [message.output.label]: message.output.translation[0].translation_text
          };
          let percent = 100 / progress.maxValue() + progress.currentValue();
          progress.update(percent);
          translationCounter.decrease();
          if (!translationCounter.count) {
            percent = 100 / progress.maxValue() + progress.currentValue();
            progress.update(percent);
            completeTranslation();
          }
        }
      }
    };
    worker.postMessage({ type: "init" });
  }
  function toggleAllLanguages(event) {
    const langCheckBoxes = document.querySelectorAll("#language-options input");
    if (event.target.checked) {
      langCheckBoxes.forEach((checkBox) => checkBox.checked = true);
    } else {
      langCheckBoxes.forEach((checkBox) => checkBox.checked = false);
    }
  }
  translateBtn.addEventListener("click", (event) => {
    translate();
  });
  function translate() {
    try {
      const source = JSON.parse(sourceDiv.value);
      localStorage.setItem("source", sourceDiv.value);
      console.log(source);
      if (source !== "") {
        progress.show();
        console.log("--Start Translation--");
        const srcLang = languageSelector.selectedLanguage();
        translations = {};
        translations[srcLang] = source;
        for (let key in source) {
          targetLanguages.values().forEach((tarLang) => {
            console.log(srcLang, "--->", tarLang);
            translations[tarLang] = {};
            if (type.value !== "REMOVE") {
              const obj = { type: "translate", label: key, text: source[key], sourceLanguage: srcLang, targetLanguage: tarLang };
              worker.postMessage(obj);
              translationCounter.increase();
            } else {
              translations[tarLang] = { ...source };
            }
          });
        }
        progress.setMaxValue(translationCounter.count);
        if (type.value === "REMOVE") {
          progress.hide();
          const fy = new Flyway(translations);
          const data = fy.createFlyways(type.value, bundle.value);
          targetDiv.value = data;
          modal.show();
        }
      } else {
        targetDiv.value = "";
      }
    } catch (e) {
      toast.show("Please provide JSON value");
      console.log(e);
    }
  }
  function completeTranslation() {
    setTimeout(() => {
      progress.hide();
      const fy = new Flyway(translations);
      const data = fy.createFlyways(type.value, bundle.value);
      targetDiv.value = data;
      modal.show();
    }, 500);
  }
})();
