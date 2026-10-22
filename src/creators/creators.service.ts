import { Injectable } from '@nestjs/common';
import { CreatorNotFoundError } from '../common/errors/creator-not-found.error';
import { CreatorsRepository } from './creators.repository';

@Injectable()
export class CreatorsService {
  constructor(private readonly creatorsRepository: CreatorsRepository) {}

  async getById(id: number): Promise<{ id: number; name: string }> {
    const creator = await this.creatorsRepository.findById(id);
    if (creator === null) {
      throw new CreatorNotFoundError();
    }
    return creator;
  }
}
