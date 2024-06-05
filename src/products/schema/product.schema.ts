import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schema';

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  contactNo: string;

  @Prop({ required: false })
  emailAddress: string;

  @Prop({ type: String })
  methodOfCommunication: string;

  @Prop({ required: true })
  brandName: string;

  @Prop({ required: true, default: false })
  sloganChoice: string;

  @Prop({ default: ' ' })
  sloganTag: string;

  @Prop({ required: true })
  brandDescription: string;

  @Prop({ required: true })
  customers: string[];

  @Prop({ required: true })
  perception: string;

  @Prop({ type: String })
  brandColor: string;

  @Prop({ type: String })
  logoType: string;

  @Prop({ required: true })
  competitors: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  likedLogos: string[];

  @Prop({ default: ' ' })
  logoIdea: string;

  @Prop({ default: ' ' })
  images: string;

  @Prop({ type: String })
  differences: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

export type ProductDocument = HydratedDocument<Product>;
