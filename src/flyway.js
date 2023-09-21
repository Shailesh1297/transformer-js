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

  createFlyways() {
    let data = '';
    Object.keys(this.translations).forEach(lkey => {
      const sqlBuilder = new SqlBuilder('SET', 'common', this.languageLocaleMap[lkey]);
      const labelValueObj = this.translations[lkey];
      Object.keys(labelValueObj).forEach(lbl => {
        sqlBuilder.addLabelValue(lbl, labelValueObj[lbl]);
      });
      data += `${sqlBuilder.build()}\n`;
    });
    return data;
  }
}