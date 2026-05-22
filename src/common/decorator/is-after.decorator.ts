import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: unknown, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints as [string];

    const object = args.object as Record<string, unknown>;
    const relatedValue = object[relatedPropertyName];

    if (propertyValue instanceof Date && relatedValue instanceof Date) {
      return propertyValue.getTime() > relatedValue.getTime();
    }

    return false;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints as [string];
    return `${args.property} deve ser posterior a ${relatedPropertyName}`;
  }
}

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}
