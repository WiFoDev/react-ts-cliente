import axios, { AxiosError, AxiosResponse } from 'axios';

import { Usuario, UsuarioWithId, ErrorResponse } from '@/types';

const client = axios.create({
  baseURL: 'https://b72b-161-10-244-216.ngrok.io/api/v1/usuarios',
});

export type APIError = AxiosError<ErrorResponse>;

async function extractData<T>(promise: Promise<AxiosResponse<T>>) {
  const { data } = await promise;
  return data;
}

export async function findAll() {
  return extractData(client.get<UsuarioWithId[]>('/'));
}

export async function createOne(usuario: Usuario) {
  return extractData(client.post<UsuarioWithId>('/', usuario));
}

export async function findOne(id: string) {
  return extractData(client.get<UsuarioWithId>(`/${id}`));
}

export async function updateOne(id: string, usuario: Usuario) {
  console.log(id);
  
  return extractData(client.put<UsuarioWithId>(`/${id}`, usuario));
}

export async function deleteOne(id: string) {
  return extractData(client.delete(`/${id}`));
}
