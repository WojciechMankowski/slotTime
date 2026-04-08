import { api } from "./api";
import { CompanyResponse } from "../Types/apiType";

export const createCompany = async (
  name_company: string,
  alias: string | null,
): Promise<CompanyResponse> => {
  const res = await api.post("/api/companies", {
    name: name_company,
    alias: alias,
    is_active: true,
  });
  return res.data;
};

export const getCompanies = async (): Promise<CompanyResponse[]> => {
  const res = await api.get("/api/companies");
  return res.data;
};

export const patchCompany = async (companyId: number, payload: CompanyResponse): Promise<CompanyResponse> => {
  const res = await api.patch<CompanyResponse>(`/api/companies/${companyId}`, payload)
  return res.data
}

export const deleteCompany = async (companyId: number): Promise<void> => {
  await api.delete(`/api/companies/${companyId}`)
}
