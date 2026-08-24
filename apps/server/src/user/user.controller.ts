import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { createUserSchema, type CreateUserDto } from '@vitenest/contracts';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@Session() session: UserSession) {
    return session.user;
  }

  @Get()
  @Roles(['admin'])
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(['admin'])
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles(['admin'])
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto) {
    return this.userService.create(body);
  }
}
