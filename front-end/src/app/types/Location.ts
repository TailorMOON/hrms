export interface Location {
    id: number;
    location_name: string;
    status: string;
  }
  
  export interface LocationCreateRequest {
    location_name: string;
    status: string;
  }
  