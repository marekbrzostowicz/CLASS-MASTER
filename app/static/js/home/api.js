export async function updateClassData(classId, changes) {
  if (Object.keys(changes).length === 0) {
    return;
  }
  try {
    const response = await fetch(`/api/updateClass/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to update class data:", error);
  }
}

export async function deleteClass(classId) {
  try {
    const response = await fetch(`/api/classes/${parseInt(classId, 10)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.log("Failed to delete", error);
  }
}

export async function fetchClasses() {
  try {
    const response = await fetch("/api/classes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const classes = await response.json();

    return classes;
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return [];
  }
}
