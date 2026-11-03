import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Completions, Deadline, StoredUser, Subject } from "./types";

/**
 * "Cơ sở dữ liệu" bằng file JSON phía server (thư mục /data).
 * Chỉ import được từ code server (gói `server-only` chặn bundle vào client).
 */
const DATA_DIR = path.join(process.cwd(), "data");

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(raw) as T;
}

// Ghi tuần tự (tránh 2 request ghi chồng lên nhau) và nguyên tử (ghi file tạm rồi rename).
let writeQueue: Promise<unknown> = Promise.resolve();

function writeJson(file: string, data: unknown): Promise<void> {
  const target = path.join(DATA_DIR, file);
  const run = async () => {
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    await fs.rename(tmp, target);
  };
  const next = writeQueue.then(run, run);
  writeQueue = next.catch(() => undefined);
  return next;
}

/* ---------- Subjects ---------- */

export async function getSubjects(): Promise<Subject[]> {
  return readJson<Subject[]>("subjects.json");
}

export async function getSubject(slug: string): Promise<Subject | undefined> {
  return (await getSubjects()).find((s) => s.slug === slug);
}

/* ---------- Deadlines ---------- */

export async function getDeadlines(): Promise<Deadline[]> {
  const list = await readJson<Deadline[]>("deadlines.json");
  return list.sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export async function getDeadline(id: string): Promise<Deadline | undefined> {
  return (await readJson<Deadline[]>("deadlines.json")).find((d) => d.id === id);
}

export async function createDeadline(input: Omit<Deadline, "id" | "createdAt">): Promise<Deadline> {
  const list = await readJson<Deadline[]>("deadlines.json");
  const nextId = list.reduce((max, d) => Math.max(max, Number(d.id) || 0), 0) + 1;
  const deadline: Deadline = { id: String(nextId), ...input, createdAt: new Date().toISOString() };
  await writeJson("deadlines.json", [...list, deadline]);
  return deadline;
}

export async function deleteDeadline(id: string): Promise<boolean> {
  const list = await readJson<Deadline[]>("deadlines.json");
  const remaining = list.filter((d) => d.id !== id);
  if (remaining.length === list.length) return false;
  await writeJson("deadlines.json", remaining);

  // Dọn trạng thái "đã xong" của deadline vừa xoá.
  const completions = await readJson<Completions>("completions.json");
  const cleaned = Object.fromEntries(
    Object.entries(completions).map(([userId, ids]) => [userId, ids.filter((x) => x !== id)]),
  );
  await writeJson("completions.json", cleaned);
  return true;
}

/* ---------- Users ---------- */

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await readJson<StoredUser[]>("users.json");
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/* ---------- Completions ---------- */

export async function getCompletedIds(userId: string): Promise<string[]> {
  const completions = await readJson<Completions>("completions.json");
  return completions[userId] ?? [];
}

/** Đặt trạng thái đã xong / chưa xong. Trả về trạng thái mới. */
export async function setCompleted(userId: string, deadlineId: string, done: boolean): Promise<boolean> {
  const completions = await readJson<Completions>("completions.json");
  const current = new Set(completions[userId] ?? []);
  if (done) current.add(deadlineId);
  else current.delete(deadlineId);
  await writeJson("completions.json", { ...completions, [userId]: [...current] });
  return done;
}
