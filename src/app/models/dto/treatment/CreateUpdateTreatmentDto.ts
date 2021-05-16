export class CreateUpdateTreatmentDto {
    reason: string; 
    sessionsFinished: number; 
    startDate: Date;
    active: boolean; 
    patientId: number;
    userId: number;
}