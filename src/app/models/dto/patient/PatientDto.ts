export class PatientDto {
    id: number;
    name: string;
    surname: string;
    reason: string;
    phoneNumber: string;
    email: string;
    urlPhoto: string;
    dateOfBirth: Date;
    age: number;
    homeAddress: string;
    schoolName: string;
    course: string;
    paymentType: string;
    active: boolean;
    clinicId: number;
}