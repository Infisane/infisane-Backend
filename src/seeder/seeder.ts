/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();
import { seeder } from 'nestjs-seeder';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSeeder } from './admin.seeder';
import { Admin, AdminSchema } from 'src/admin/schema';

seeder({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
}).run([AdminSeeder]);
