export class MtsDto {
    id: number;
    date: Date;

    patientId: string;
    patientFullName: string;
    patientAge: string;
    patientPhone: string;
    patientPhoto: string;

    specialistId: number;
    specialistFullName: number;
    specialistType: string;

    treatmentId: number;
    reasonTratment: string;
    
    clinicId: number;
    clinicName: string;
}