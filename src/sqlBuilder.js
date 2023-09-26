export class SqlBuilder {

  skeleton = {
    prefix: "UPDATE msb_config SET configuration = JSON_{type}(configuration,",
    content: '',
    suffix: ") WHERE configType = 'LOCALE_MESSAGES_CONFIG' AND JSON_EXTRACT(configuration, '$.key') = 'msb_{module}' AND JSON_EXTRACT(configuration, '$.locale') = '{language}';"
  }
  constructor(type = 'UPDATE', module = 'common', language = 'EN') {
    this.type = type;
    if (type !== 'CREATE') {
      this.skeleton.prefix = this.inject(this.skeleton.prefix, { type: type == 'UPDATE' ? 'SET' : 'REMOVE' });
      this.skeleton.suffix = this.inject(this.skeleton.suffix, { module: module, language: language });
    } else {
      this.newBundle(module,language);
    }
  }

  build() {
    return `${this.skeleton.prefix} ${this.skeleton.content} ${this.skeleton.suffix}`;
  }

  addLabelValue(label, value, separator = false) {
    let modLabel = '';
    switch (this.type) {
      case 'CREATE':
        modLabel = `"${label}":"${value}" ${separator ? ',' : ''}`;
        break;
      case 'REMOVE':
        modLabel = `'$.bundle.${label}'${separator ? ',' : ''}`;
        break;
      default:
        modLabel = `'$.bundle.${label}',"${value}"${separator ? ',' : ''}`;
    }
    this.skeleton.content += modLabel;
  }

  newBundle(module, language) {
    this.skeleton.prefix = this.inject(`call proc_add_config_row("LOCALE_MESSAGES_CONFIG", '{ "key": "msb_{module}","bundle": {`, { module: module });
    this.skeleton.suffix = this.inject(`},"locale": "{language}" }', "ENABLED");`, { language: language });
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