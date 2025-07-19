export interface MindMapNode {
  id: string
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

export interface CalendarEvent {
  id: string
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

export interface NodeData extends Record<string, unknown> {
  id: string
  title: string
  description?: string
  x?: number
  y?: number
  color: string
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  executionPeriod?: {
    type: 'date' | 'week' | 'month'
    value: Date | string
  }
  isScheduled: boolean
}