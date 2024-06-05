import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Admin } from 'src/admin/schema';
import { User } from 'src/users/schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    let user;

    if (payload.role === 'admin') {
      user = await this.adminModel.findById({ _id: payload.sub }).exec();
    } else if (payload.role === 'user') {
      user = await this.userModel.findById({ _id: payload.sub }).exec();
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    delete user.password;
    return user;
  }
}
