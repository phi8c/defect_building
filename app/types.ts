export enum TabView {
  ANALYSIS = 'ANALYSIS',
  TRAINING = 'TRAINING',
  SETTINGS = 'SETTINGS'
}

export enum DefectCategory {
  WALL = 'Wall',
  PAINT = 'Paint',
  ELECTRICAL = 'Electrical',
  FLOORING = 'Flooring',
  PLUMBING = 'Plumbing',
  STRUCTURAL = 'Structural',
  OTHER = 'Other'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface DefectResult {
  subject: string;
  description: string;
  category: string;
  severity: Severity;
  confidence: number;
  remedySuggestion?: string;
}

export interface TrainingMetric {
  epoch: number;
  accuracy: number;
  loss: number;
  val_accuracy: number;
  val_loss: number;
}

export interface FolderNode {
  name: string;
  count: number;
  type: 'folder' | 'file';
  children?: FolderNode[];
}