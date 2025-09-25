import mongoose, { Schema, Document } from 'mongoose';
import Task from './task';

export interface ICourse extends Document {
  name: string;
  code: string;
  userId: mongoose.Types.ObjectId;
}

const CourseSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

CourseSchema.pre('findOneAndDelete', async function (next) {
  const courseId = this.getQuery()['_id'];
  await Task.deleteMany({ courseId });
  next();
});


export default mongoose.model<ICourse>('Course', CourseSchema);