import { Controller, Get, Param } from '@nestjs/common';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { CreatorsService } from './creators.service';
import { CreatorResponse } from './dto/creator.response';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get(':creatorId')
  async getById(
    @Param('creatorId', PositiveIntPipe) creatorId: number,
  ): Promise<CreatorResponse> {
    const creator = await this.creatorsService.getById(creatorId);
    return new CreatorResponse(creator.id, creator.name);
  }
}
