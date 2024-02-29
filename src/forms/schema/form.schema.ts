import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class Form {
  @Prop({ required: true })
  email: string;

  @Prop({ required: false })
  contactNo: string;

  @Prop({ required: false })
  emailAddress: string;

  @Prop({ enum: ['Instant Messaging (WhatsApp)', 'Email', 'Call'] })
  methodOfCommunication: string;

  @Prop({ required: true })
  brandName: string;

  @Prop({ required: true, default: false })
  sloganChoice: boolean;

  @Prop({ default: ' ' })
  sloganTag: string;

  @Prop({ required: true })
  brandDescription: string;

  @Prop({ required: true })
  customers: string[];

  @Prop({ required: true })
  perception: string;

  @Prop({
    required: true,
    enum: [
      'Blue',
      'Red',
      'Green',
      'Yellow',
      'Orange',
      'Purple',
      'Black',
      'Brown',
      'Your Choice',
      ' ',
    ],
  })
  brandColor: string;

  @Prop({ required: true, enum: ['Maximalist', 'Minimalist', ' '] })
  logoType: string;

  @Prop({ required: true })
  competitors: string;

  @Prop({ required: true })
  likedLogos: string[];

  @Prop({ default: ' ' })
  logoIdea: string;

  @Prop({ default: ' ' })
  images: string;
}

export const FormSchema = SchemaFactory.createForClass(Form);

export type FormDocument = HydratedDocument<Form>;
