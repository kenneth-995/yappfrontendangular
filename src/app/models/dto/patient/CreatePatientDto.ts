export class CreatePatientDto {
    id: number;
    name: string;
    surname: string;
    reason: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string;
    homeAddress: string;
    schoolName: string;
    course: string;
    paymentType: string;
    active: boolean;
    clinicId: number;
}