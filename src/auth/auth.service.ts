import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin } from 'src/admin/schema';
import { IResponse } from 'src/interfaces';
import { LoginDto, SignInDto, SignUpDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { JwtHelper } from 'src/common/helpers';
import { User } from 'src/users/schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel('Admin') private readonly adminModel: Model<Admin>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}
  async signIn(signInDto: SignInDto): Promise<IResponse> {
    try {
      const admin = await this.adminModel.findOne({ email: signInDto.email });

      if (!admin) {
        throw new NotFoundException(
          `User with email ${signInDto.email} not found`,
        );
      }

      const passMatches = await argon.verify(
        admin.password,
        signInDto.password,
      );

      if (!passMatches) {
        throw new UnauthorizedException('Invalid login credentials');
      }

      const accessToken = JwtHelper.signToken(admin.id, admin.role);

      this.logger.log(`Admin signed in successfully`);
      return {
        statusCode: 200,
        message: 'Signed in successfully',
        data: accessToken,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Error during sign-in: ${error.message}`);
      throw error;
    }
  }

  async logIn(loginDto: LoginDto): Promise<IResponse> {
    try {
      const user = await this.userModel.findOne({ email: loginDto.email });

      if (!user) {
        throw new NotFoundException(
          `User with email ${loginDto.email} not found`,
        );
      }

      const passMatches = await argon.verify(user.password, loginDto.password);

      if (!passMatches) {
        throw new UnauthorizedException('Invalid login credentials');
      }

      const accessToken = JwtHelper.signToken(user.id, user.role);

      this.logger.log(`User signed in successfully`);
      return {
        statusCode: 200,
        message: 'Signed in successfully',
        data: accessToken,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Error during sign-in: ${error.message}`);
      throw error;
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<IResponse> {
    const existingUser = await this.userModel.findOne({
      email: signUpDto.email,
    });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        throw new BadRequestException('Admin with this email already exists');
      } else {
        throw new BadRequestException('User with this email already exists');
      }
    }

    const hashedPassword = await argon.hash(signUpDto.password);

    const newUser = new this.userModel({
      ...signUpDto,
      password: hashedPassword,
    });

    try {
      const savedUser = await newUser.save();
      savedUser.password = undefined;

      const response: IResponse = {
        statusCode: 201,
        message: 'User created successfully',
        data: savedUser,
        error: null,
      };
      return response;
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }
}
