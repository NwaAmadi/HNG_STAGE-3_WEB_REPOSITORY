export type Role = "admin" | "analyst";

export type User = {
  id: string;
  username: string;
  role: Role;
};

export type Profile = {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
};

export type Envelope<T> = {
  status: "success";
  data: T;
};

export type PaginatedProfilesResponse = {
  status: "success";
  page: number;
  limit: number;
  total: number;
  data: Profile[];
};
