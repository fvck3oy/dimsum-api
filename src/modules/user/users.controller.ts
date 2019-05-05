import {
  Controller,
  Req,
  Res,
  HttpStatus,
  Body,
  Get,
  Post,
  Put,
  Param,
  Delete,
  HttpCode,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiUseTags } from '@nestjs/swagger';
import { AppConfigure } from '../../configures/global.configure';
var sha512 = require('js-sha512');
import * as jwt from 'jsonwebtoken';

// import { diskStorage } from 'multer';
// import * as path from 'path';
// import * as _ from 'lodash';

@ApiUseTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get()
  async findAll(@Req() $req, @Res() $res) {
    try {
      let where = await `users.isDisable = false`;
      let relations = await [];
      let order = await [];

      let userData = await this.userService.queryBuilder(
        where,
        // relations,
        // order,
      );

      await $res.status(HttpStatus.OK).json(userData);
    } catch ($ex) {
      await $res.status(HttpStatus.OK).json({ message: 'Error' });
    }
  }

  @Get('allusers')
  async findAllusers(@Req() $req, @Res() $res) {
    try {
      let where = await `users.isDisable = false && users.role = 'user' `;
      let relations = await [];
      let order = await [];
      let userData = await this.userService.queryBuilder(
        where,
        // relations,
        // order,
      );

      await $res.status(HttpStatus.OK).json(userData);
    } catch ($ex) {
      await $res.status(HttpStatus.OK).json({ message: 'Error' });
    }
  }

  @Post('create')
  async createUser(@Body() $body, @Res() $res) {
    try {
      // if ($body.id) {
      //   $body.id = await parseInt($body.id.toString());
      // }
      console.log($body);

      let users = await Object.assign({}, $body);

      users.password = await sha512
        .update($body['password'])
        .update(AppConfigure.hkey)
        .hex();

      console.log('sha .... ', users.password);

      users = await this.userService.saveOne(users);
      await $res.status(HttpStatus.OK).json(users);
    } catch ($ex) {
      await $res
        .status(HttpStatus.OK)
        .json({ message: 'Please fill password to same of both' });
    }
  }

  @Post('login')
  async login(@Body() $body, @Res() $res) {
    try {
      console.log('รหัสที่ป้อนเข้ามา ... : ', $body); //แสดงข้อมูลของ  $body

      let user = await this.userService.findOne({
        where: {
          email: $body['email'],
        },
      });

      if (user) {
        if (
          user.password ==
          (await sha512
            .update($body['password'])
            .update(AppConfigure.hkey)
            .hex())
        ) {

          let token = jwt.sign(
            {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              role: user.role,
              email: user.email,
            },
            'shhhhh',
            { expiresIn: '24h' },
          );
          console.log('token : ', token);
          await $res.status(HttpStatus.OK).json({ token });
          
        } else {
          await $res
            .status(HttpStatus.OK)
            .json({ message: 'Invalid password' });
        }
      } else {
        await $res.status(HttpStatus.OK).json({ message: 'Email not found' });
      }
    } catch ($ex) {
      await $res
        .status(HttpStatus.OK)
        .json({ message: 'Email or Password Invalid' });
    }
  }
}
