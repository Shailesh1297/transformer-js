export class SqlBuilder {

  skeleton = {
    prefix: "UPDATE msb_config SET configuration = JSON_{type}(configuration",
    content: '',
    suffix: ") WHERE configType = 'LOCALE_MESSAGES_CONFIG'",
    module: "AND JSON_EXTRACT(configuration, '$.key') = 'msb_{module}'",
    language: "AND JSON_EXTRACT(configuration, '$.locale') = '{language}';"
  }
  constructor(type='SET',module='common',language='EN') {
    this.type = type;
    this.skeleton.prefix = this.inject(this.skeleton.prefix,{type: type });
    this.skeleton.module = this.inject(this.skeleton.module,{module: module });
    this.skeleton.language = this.inject(this.skeleton.language,{language: language });
  }

  build() {
    return `${this.skeleton.prefix} ${this.skeleton.content} ${this.skeleton.suffix} ${this.skeleton.module} ${this.skeleton.language}`;
  }

  addLabelValue(label,value) {
    const modLabel = `,'$.bundle.${label}','${value}'`;
    this.skeleton.content += modLabel;
  }

  //injection
  inject(template, placeHolders) {
    let exp, placeHolder;
    for (placeHolder in placeHolders) {
      exp = new RegExp(`{${placeHolder}}`, 'i');
      template = template.replace(exp, placeHolders[placeHolder]);
    }
    return template;
  }
}