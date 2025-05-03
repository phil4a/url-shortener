import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from '@src/app.service';
import { CreateUserDto } from '@src/create-user.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('users')
  async getUsers() {
    return await this.appService.getUsers();
  }
  @Post('users')
  async createUser(@Body() payload: CreateUserDto) {
    await this.appService.createUser(payload);
  }
}
