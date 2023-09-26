import { SqlBuilder } from "./sqlBuilder";

export class Flyway {
  languageLocaleMap = {
    "eng_Latn":'EN',
    "hin_Deva":'HI',
    "zho_Hant":'ZH',
    "ace_Arab":'AR',
    "fra_Latn":'FR',
    "spa_Latn":'ES',
    "deu_Latn":'DE',
    "nld_Latn":'NL',
    "rus_Cyrl":'RU',
    "bul_Cyrl":'BG',
    "ron_Latn":'RO',
    "por_Latn":'PT',
    "ita_Latn":'IT'
  }
  constructor(translations) {
    this.translations = translations;
  }

  createFlyways(type='UPDATE',bundle='common') {
    console.log(type,'-->',bundle);
    let data = '';
    Object.keys(this.translations).forEach(lkey => {
      const sqlBuilder = new SqlBuilder(type, bundle, this.languageLocaleMap[lkey]);
      const labelValueObj = this.translations[lkey];
      Object.keys(labelValueObj).forEach((lbl,idx,lvoKeys) => {
        sqlBuilder.addLabelValue(lbl, labelValueObj[lbl], lvoKeys.length != (idx + 1));
      });
      data += `${sqlBuilder.build()}\n`;
    });
    return data;
  }
}