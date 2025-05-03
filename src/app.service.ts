import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { CreateUserDto } from '@src/create-user.dto';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}
  async getHello() {
    return 'Hello World!';
  }

  async getUsers() {
    const users = await this.databaseService.user.findMany();
    return users;
  }
  async createUser(dto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.databaseService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user if doesn't exist
    const user = await this.databaseService.user.create({
      data: {
        email: dto.email,
      },
    });
    return user;
  }
}
