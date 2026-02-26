import mongoose, { Document, Schema } from "mongoose";

// ממשק TypeScript שמייצג מסמך Customer ב-MongoDB
export interface ICustomer extends Document {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

export default Customer;
