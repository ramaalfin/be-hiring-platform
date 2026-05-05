// Standardized API Response Types
export interface ApiSuccessResponse<T = any> {
    success: true;
    message?: string;
    data: T;
    meta?: PaginationMeta;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        field?: string;
        details?: any;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// User Types
export interface UserDTO {
    id: string;
    fullName: string;
    email: string;
    role: "ADMIN" | "CANDIDATE" | "EMPLOYER";
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserDTO {
    fullName: string;
    email: string;
    password: string;
}

// Job Types
export type ProfileFieldStatus = "MANDATORY" | "OPTIONAL" | "OFF";

export interface ProfileRequirements {
    fullName: ProfileFieldStatus;
    photoProfile: ProfileFieldStatus;
    gender: ProfileFieldStatus;
    domicile: ProfileFieldStatus;
    email: ProfileFieldStatus;
    phoneNumber: ProfileFieldStatus;
    linkedinLink: ProfileFieldStatus;
    dateOfBirth: ProfileFieldStatus;
}

export interface JobDTO {
    id: string;
    jobName: string;
    jobType: string;
    jobDescription: string;
    numberOfCandidateNeeded: number;
    minimumSalary: string;
    maximumSalary: string;
    minimumProfileInformationRequired: ProfileRequirements;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateJobDTO {
    jobName: string;
    jobType: string;
    jobDescription: string;
    numberOfCandidateNeeded: number;
    minimumSalary: string;
    maximumSalary: string;
    minimumProfileInformationRequired: ProfileRequirements;
}

export interface UpdateJobDTO extends Partial<CreateJobDTO> { }

// Employer Job Types
export interface JobFilters {
    search?: string;
    jobType?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: "asc" | "desc";
}

export interface EmployerJobDTO extends JobDTO {
    employerId: string;
    _count?: {
        applications: number;
    };
}

// Application Types
export interface ResumeData {
    fullName?: string;
    photoProfile?: string;
    gender?: string;
    domicile?: string;
    email?: string;
    phoneNumber?: string;
    linkedinLink?: string;
    dateOfBirth?: string;
    [key: string]: any;
}

export interface ApplicationDTO {
    id: string;
    jobId: string;
    userId: string;
    resume: ResumeData;
    createdAt: Date;
}

// Session Types
export interface SessionDTO {
    id: string;
    userId: string;
    userAgent?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Auth Types
export interface LoginDTO {
    email: string;
    password: string;
    userAgent?: string;
}

export interface RegisterDTO {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    userAgent?: string;
}

export interface AuthTokens {
    access_token: string;
    refresh_token: string;
}

export interface AuthResponse extends AuthTokens {
    user: UserDTO;
}

// Application Status Types
export type ApplicationStatus = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

export interface ApplicationStatusHistoryDTO {
    id: string;
    applicationId: string;
    fromStatus: string;
    toStatus: string;
    changedBy: string;
    changedByUser: {
        id: string;
        fullName: string;
        email: string;
    };
    changedAt: Date;
    reason?: string | null;
}

export interface ApplicationWithUserDTO {
    id: string;
    jobId: string;
    userId: string;
    resume: any;
    status: ApplicationStatus;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        fullName: string;
        email: string;
    };
}

// Search Types
export interface SearchFilters {
    jobType?: string;
    minSalary?: number;
    maxSalary?: number;
}

export interface SearchPagination {
    page?: number;
    limit?: number;
}

export interface SearchResult {
    data: JobDTO[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
