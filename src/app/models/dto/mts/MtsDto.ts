export class MtsDto {
    id: number;
    date: Date;

    patientId: number;
    patientFullName: string;
    patientAge: number;
    patientPhone: string;
    patientPhoto: string;

    specialistId: number;
    specialistFullName: number;
    specialistType: string;

    treatmentId: number;
    reason: string; //treatment
    
    clinicId: number;
    clinicName: string;
}