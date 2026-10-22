import { Module } from '@nestjs/common';
import { FollowersController } from './followers.controller';
import { FollowersRepository } from './followers.repository';
import { FollowersService } from './followers.service';

@Module({
  controllers: [FollowersController],
  providers: [FollowersService, FollowersRepository],
})
export class FollowersModule {}
