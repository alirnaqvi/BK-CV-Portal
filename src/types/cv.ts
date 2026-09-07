export interface CVItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  domain: string;
  experienceYears: number | null;
  currentRole: string | null;
  currentCompany: string | null;
  education: string | null;
  skills: string | null;
  city: string | null;
  notes: string | null;
  fileUrl: string;
  filePathname: string;
  fileName: string;
  fileSize: number | null;
  fileType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CVListResponse {
  items: CVItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
