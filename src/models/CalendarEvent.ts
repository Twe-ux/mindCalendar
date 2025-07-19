import mongoose, { Schema, Document } from 'mongoose'

export interface ICalendarEvent extends Document {
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  googleEventId?: string
  mindMapNodeId?: string
  isFromMindMap: boolean
  createdAt: Date
  updatedAt: Date
}

const CalendarEventSchema: Schema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  googleEventId: { type: String },
  mindMapNodeId: { type: String },
  isFromMindMap: { type: Boolean, default: false }
}, {
  timestamps: true
})

CalendarEventSchema.index({ userId: 1 })
CalendarEventSchema.index({ startDate: 1 })
CalendarEventSchema.index({ googleEventId: 1 })

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)