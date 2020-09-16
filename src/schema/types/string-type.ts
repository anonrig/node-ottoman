import { CoreType } from './core-type';
import { generateUUID } from '../../utils/generate-uuid';
import { is } from '../../utils/is-type';
import { ValidationError } from '../errors';
import { CoreTypeOptions } from '../interfaces/schema.types';

type FunctionsString = () => string[];

export interface StringTypeOptions {
  enum?: string[] | FunctionsString;
}

/**
 * @inheritDoc
 * @param options.enum defines a list of allowed values.
 */
export class StringType extends CoreType {
  constructor(name: string, options?: CoreTypeOptions & StringTypeOptions) {
    super(name, String.name, options);
  }

  get enumValues(): unknown {
    const _options = this.options as StringTypeOptions;
    return _options.enum;
  }

  buildDefault(): string | undefined {
    if (this.auto === 'uuid') {
      return generateUUID();
    }
    const _value = super.buildDefault();
    return typeof _value === 'undefined' ? _value : String(_value);
  }

  cast(value: unknown, strategy) {
    super.cast(value, strategy);
    const _wrongType = this.isStrictStrategy(strategy) ? !is(value, String) : is(value, Object);
    if (_wrongType) {
      throw new ValidationError(`Property ${this.name} must be of type ${this.typeName}`);
    }
    if (value === null || value === undefined) {
      return value;
    }
    let errors: string[] = [];
    const _value = String(value);
    errors.push(this._checkEnum(_value) || '');
    this.checkValidator(_value);
    errors = errors.filter((e) => e !== '');
    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }
    return _value;
  }

  private _checkEnum(value: string): string | void {
    if (typeof this.enumValues !== 'undefined') {
      const _enumValues = typeof this.enumValues === 'function' ? this.enumValues() : this.enumValues;
      if (!_enumValues.includes(value)) {
        return `Property ${this.name} value must be ${_enumValues.join(',')}`;
      }
    }
  }

  isEmpty(value: string): boolean {
    return [, null, ''].includes(value);
  }
}

export const stringTypeFactory = (key: string, opts: StringTypeOptions & CoreTypeOptions): StringType =>
  new StringType(key, opts);
