export type GroupMember = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type Group = {
  _id: string;
  name: string;
  members: GroupMember[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

const base = "/api/groups";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw err;
  }
  return res.json().catch(() => ({}));
}

export async function getGroups(): Promise<Group[]> {
  const res = await fetch(`${base}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function getGroup(id: string): Promise<{ group: Group }> {
  const res = await fetch(`${base}/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createGroup(name: string, memberEmails: string[] = []) {
  const res = await fetch(`${base}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name, memberEmails }),
  });
  return handleResponse(res);
}

export async function updateGroup(
  id: string,
  payload: {
    name?: string;
    addMemberEmails?: string[];
    removeMemberIds?: string[];
  }
) {
  const res = await fetch(`${base}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteGroup(id: string) {
  const res = await fetch(`${base}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
