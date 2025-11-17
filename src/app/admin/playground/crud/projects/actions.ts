"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { create, update, del, completeTask } from "@/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import { FakeTaskDto } from "@/modules/fake/fakeProjectsCrud/dtos/FakeTaskDto";

type ActionResult = {
  success?: string;
  error?: string;
};

export async function createFakeProject(formData: FormData): Promise<ActionResult> {
  try {
    const name = formData.get("name")?.toString() ?? "";
    const description = formData.get("description")?.toString();
    const tasks: Partial<FakeTaskDto>[] = formData.getAll("tasks[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    const isActive = formData.get("isActive");
    const active = isActive ? isActive.toString() === "on" || isActive.toString() === "true" : false;

    if (!name) {
      return { error: "Please fill all fields" };
    }

    if (tasks.length === 0) {
      return { error: "Please add at least one task" };
    }

    const item = await create({
      name,
      description,
      active,
      tasks,
    });
    
    revalidatePath("/admin/playground/crud/projects");
    redirect(`/admin/playground/crud/projects/${item.id}`);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateProject(
  projectId: string,
  data: {
    name: string;
    description?: string;
    active: boolean;
    tasks: Partial<FakeTaskDto>[];
  }
): Promise<ActionResult> {
  try {
    if (!data.name) {
      return { error: "Please fill all fields" };
    }

    if (data.tasks.length === 0) {
      return { error: "Please add at least one task" };
    }

    await update(projectId, {
      name: data.name,
      description: data.description,
      active: data.active,
      tasks: data.tasks,
    });

    revalidatePath(`/admin/playground/crud/projects/${projectId}`);
    revalidatePath("/admin/playground/crud/projects");
    
    return { success: "Project updated" };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await del(projectId);
    revalidatePath("/admin/playground/crud/projects");
    redirect("/admin/playground/crud/projects");
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export async function completeTask(projectId: string, taskId: string): Promise<ActionResult> {
  try {
    await completeTask(projectId, taskId);
    revalidatePath(`/admin/playground/crud/projects/${projectId}`);
    return { success: "Task completed" };
  } catch (e: any) {
    return { error: e.message };
  }
}
