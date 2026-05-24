export const seedDatabase = async () => {
    const defaultColumns = [
        { title: "To Do", order: 0 },
        { title: "In Progress", order: 1 },
        { title: "Done", order: 2 },
    ];

    for (const columnData of defaultColumns) {
        try {
            const response = await fetch("/api/columns/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(columnData),
            });

            if (response.ok) {
                console.log(`Created column: ${columnData.title}`);
            } else {
                console.error(`Failed to create column: ${columnData.title}`);
            }
        } catch (error) {
            console.error(`Error creating column ${columnData.title}:`, error);
        }
    }
};
