import { Controller, Get } from '@nestjs/common';
import { UserResponse } from './dto/user.response';
import { UsersRepository } from './users.repository';

@Controller('users')
export class UsersController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get()
  async list(): Promise<UserResponse[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => new UserResponse(user.id, user.name));
  }
}
