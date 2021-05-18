export class CreatePatientDto {
    id: number;
    name: string;
    surname: string;
    reason: string;
    phoneNumber: string;
    email: string;
    urlPhoto: string;
    dateOfBirth: Date;
    homeAddress: string;
    schoolName: string;
    course: string;
    paymentType: string;
    clinicId: number;
    //active: boolean;
}