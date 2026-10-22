import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { FollowCreatorRequest } from './dto/follow-creator.request';
import { FollowStatusResponse } from './dto/follow-status.response';
import { FollowersCountResponse } from './dto/followers-count.response';
import { FollowersService } from './followers.service';

@Controller('creators/:creatorId/followers')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post()
  async follow(
    @Param('creatorId', PositiveIntPipe) creatorId: number,
    @Body() body: FollowCreatorRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<FollowersCountResponse> {
    const { created, count } = await this.followersService.follow(
      creatorId,
      body.userId,
    );
    response.status(created ? 201 : 200);
    return new FollowersCountResponse(creatorId, count);
  }

  @Delete(':userId')
  @HttpCode(204)
  async unfollow(
    @Param('creatorId', PositiveIntPipe) creatorId: number,
    @Param('userId', PositiveIntPipe) userId: number,
  ): Promise<void> {
    await this.followersService.unfollow(creatorId, userId);
  }

  @Get('count')
  async getCount(
    @Param('creatorId', PositiveIntPipe) creatorId: number,
  ): Promise<FollowersCountResponse> {
    const count = await this.followersService.getCount(creatorId);
    return new FollowersCountResponse(creatorId, count);
  }

  @Get(':userId')
  async getStatus(
    @Param('creatorId', PositiveIntPipe) creatorId: number,
    @Param('userId', PositiveIntPipe) userId: number,
  ): Promise<FollowStatusResponse> {
    const following = await this.followersService.getStatus(creatorId, userId);
    return new FollowStatusResponse(following);
  }
}
