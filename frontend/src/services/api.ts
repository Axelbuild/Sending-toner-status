import type { Group, GroupInput } from "../types/group";
import type { PrinterInput, PrinterStatus } from "../types/printer";

const API_BASE = "http://localhost:3333";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Erro na requisição.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function fetchPrinterStatus(): Promise<PrinterStatus[]> {
  const response = await fetch(`${API_BASE}/printer/status-last`);
  return handleResponse<PrinterStatus[]>(response);
}

export async function fetchGroups(): Promise<Group[]> {
  const response = await fetch(`${API_BASE}/group`);
  return handleResponse<Group[]>(response);
}

export async function createGroup(data: GroupInput): Promise<Group> {
  const response = await fetch(`${API_BASE}/group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Group>(response);
}

export async function updateGroup(id: number, data: GroupInput): Promise<Group> {
  const response = await fetch(`${API_BASE}/group/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Group>(response);
}

export async function deleteGroup(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/group/${id}`, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}

export async function createPrinter(data: PrinterInput): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/printer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<{ message: string }>(response);
}

export async function updatePrinter(
  id: number,
  data: Partial<PrinterInput>
): Promise<unknown> {
  const response = await fetch(`${API_BASE}/printer/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<unknown>(response);
}

export async function deletePrinter(id: number): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE}/printer/${id}`, {
    method: "DELETE",
  });

  return handleResponse<{ message: string }>(response);
}