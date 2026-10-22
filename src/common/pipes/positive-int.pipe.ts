import { BadRequestException, PipeTransform } from '@nestjs/common';

const MAX_INT = 2147483647;

export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    if (!/^[1-9]\d*$/.test(value) || Number(value) > MAX_INT) {
      throw new BadRequestException();
    }
    return Number(value);
  }
}
