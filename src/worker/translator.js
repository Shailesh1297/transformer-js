import { pipeline, env } from "../transformer/js/transformers.js";

env.backends.onnx.wasm.wasmPaths = '../transformer/wasm/';

class TranslationPipeline {
  static task = 'translation';
  // static model = 'facebook/nllb-200-distilled-1.3B';
  static model = 'Xenova/nllb-200-distilled-600M';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  // Retrieve the translation pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
  let translator = await TranslationPipeline.getInstance(x => {
       // We also add a progress callback to the pipeline so that we can
        // track model loading.
        if(x.status == 'ready') {
          //once model is loaded completely
          postMessage(x);
        }
  });
  const data = event.data;

  // Actually perform the translation
  let output = await translator(data.text, {
    tgt_lang: data.targetLanguage,
    src_lang: data.sourceLanguage,

    // Allows for partial output
    // callback_function: x => {
    //   postMessage({
    //     status: 'update',
    //     output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
    //   });
    // }
  });

   // Send the output back to the main thread
  postMessage({
    status: 'complete',
    output: output,
  });
});
