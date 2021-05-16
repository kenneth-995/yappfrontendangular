export class TreatmentDto {
    id: number;
    reason: string;
    sessionsFinished: number;
    startDate: Date;
    patientId: number;
    patientFullName: string;
    patientAge: number;
    patientPhone: string;
    patientPhoto: string;
    specialistId: number;
    specialistFullName: string;
    specialistType: string;
}