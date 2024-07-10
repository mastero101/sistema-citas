import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private baseURL: string = 'http://localhost:5000/api/appointments';

  constructor() { }

  async getAppointments(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async createAppointment(appointmentData: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseURL}`, appointmentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
  
  async updateAppointment(id: string, appointmentData: any): Promise<any> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<any> {
    try {
      const response = await axios.delete(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: any) {
    console.error('API call error:', error);
  }
}

export const appointmentService = new AppointmentService();