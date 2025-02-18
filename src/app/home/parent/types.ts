export type Parent = {
  id: string;
  fullname: string;
  contact_number: string;
  address?: {
    id?: string;
    purok: string;
    baranggay: string;
    municipality: string;
    province: string;
  };
  auth: {
    id?: string;
    email: string;
  };
  lastLogin: string | null;
};
