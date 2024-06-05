import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Seeder } from 'nestjs-seeder';
import * as argon from 'argon2';
import { Admin, AdminDocument } from 'src/admin/schema';

@Injectable()
export class AdminSeeder implements Seeder {
  constructor(
    @InjectModel(Admin.name)
    private readonly AdminModel: Model<AdminDocument>,
  ) {}

  async seed(): Promise<any> {
    const newAdmin: Admin[] = [
      {
        email: 'infisane@gmail.com',
        name: 'Infisane',
        phone: '+234 636 623 564',
        password: await argon.hash('__infisane###'),
        role: 'admin',
      },
      {
        email: 'test-admin@mail.com',
        name: 'Test Admin',
        phone: '234 253 622 673',
        password: await argon.hash('_tes@infi$ane'),
        role: 'admin',
      },
    ];

    return this.AdminModel.insertMany(newAdmin);
  }

  async drop(): Promise<any> {
    return this.AdminModel.deleteMany({});
  }
}
