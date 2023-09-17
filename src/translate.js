import { pipeline, env } from "@xenova/transformers";
// Specify a custom location for models (defaults to '/models/').
// env.localModelPath = 'models';

// Disable the loading of remote models from the Hugging Face Hub:
env.allowRemoteModels = false;

export class Translator {
    #translator = null;
    #source = "eng_Latn";
    #target = "hin_Deva";
    #model = 'Xenova/nllb-200-distilled-600M';

    set source(source_language) {
        this.#source = source_language;
    }

    set target(target_language) {
        this.#target = target_language;
    }

    get model() {
        return this.#model;
    }

    constructor(model='Xenova/nllb-200-distilled-600M'){
        this.#model = model;
        this.#init();
    }

   #init() {
       pipeline('translation', this.#model)
        .then(translater => {
            this.#translator = translater;
            document.dispatchEvent(this.#onInitializedEvent());
            console.log("--translater initialized--");
        })
    }

    #onInitializedEvent() {
       return new CustomEvent('translaterInitialized',{
        detail: this.#translator
       });
    }

    async translate(data) {
        return this.#translator(data, {
            src_lang: this.#source,
            tgt_lang: this.#target
        });
    }
}