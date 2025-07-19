import mongoose, { Schema, Document } from 'mongoose'

export interface IMindMapNode extends Document {
  userId: string
  title: string
  description?: string
  x: number
  y: number
  color: string
  tags: string[]
  executionPeriod?: {
    type: 'date' | 'week' | 'month'
    value: Date | string
  }
  priority: 'low' | 'medium' | 'high'
  isScheduled: boolean
  scheduledDate?: Date
  connections: string[]
  createdAt: Date
  updatedAt: Date
}

const MindMapNodeSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, default: '#3b82f6' },
  tags: [{ type: String }],
  executionPeriod: {
    type: {
      type: String,
      enum: ['date', 'week', 'month']
    },
    value: Schema.Types.Mixed
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  isScheduled: { type: Boolean, default: false },
  scheduledDate: { type: Date },
  connections: [{ type: String }]
}, {
  timestamps: true
})

MindMapNodeSchema.index({ userId: 1 })

export default mongoose.models.MindMapNode || mongoose.model<IMindMapNode>('MindMapNode', MindMapNodeSchema)