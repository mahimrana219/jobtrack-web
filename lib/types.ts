export const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
};

export interface Application {
  _id: string;
  company: string;
  role: string;
  status: Status;
  jobUrl?: string;
  location?: string;
  salary?: string;
  appliedOn?: string;
  followUpOn?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ApplicationInput = Omit<Application, '_id' | 'createdAt' | 'updatedAt'>;

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ListQuery {
  status?: Status;
  search?: string;
  sort?: 'newest' | 'oldest' | 'company';
  page?: number;
  limit?: number;
}

export interface ListResult {
  items: Application[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  responseRate: number;
  followUpsDue: number;
}
