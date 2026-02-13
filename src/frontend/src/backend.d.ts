import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Inquiry {
    id: bigint;
    serviceCategory?: string;
    internal: boolean;
    inquiryType: InquiryType;
    name: string;
    read: boolean;
    email?: string;
    message: string;
    timestamp: Time;
    phoneNumber: string;
}
export interface UserProfile {
    name: string;
}
export enum InquiryType {
    contact = "contact",
    serviceRequest = "serviceRequest"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteInquiry(inquiryId: bigint): Promise<void>;
    getAllInquiries(): Promise<Array<Inquiry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControlWithSecret(secret: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setInquiryReadStatus(inquiryId: bigint, read: boolean): Promise<void>;
    submitInquiry(inquiryType: InquiryType, name: string, phoneNumber: string, email: string | null, message: string, serviceCategory: string | null): Promise<bigint>;
}
