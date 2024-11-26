import fs, { writeFileSync } from "fs";
import type {
    Vertical,
    CategoryAttribute,
    Category,
} from "./interfaces/shopifyTaxonomy";

async function main() {
    const data: { verticals: Vertical[] } = JSON.parse(
        fs.readFileSync("data/categories.json", "utf-8")
    );

    // Flatten and process all categories
    const categories = flattenVerticals(data.verticals);

    // Prepare data for bulk upsert
    const categoryInserts = categories.map((category) => ({
        id: category.id,
        name: category.name,
        breadcrumb: category.breadcrumb,
        attributes: mapAttributesToRecord(category.attributes),
        parentCategoryId: category.parent_id,
    }));

    writeFileSync(
        "data/output.json",
        JSON.stringify(categoryInserts, null, 2),
        "utf8"
    );
}

function flattenVerticals(verticals: Vertical[]): {
    id: string;
    name: string;
    breadcrumb: string;
    parent_id: string | null;
    attributes: CategoryAttribute[];
}[] {
    const result: {
        id: string;
        name: string;
        breadcrumb: string;
        parent_id: string | null;
        attributes: CategoryAttribute[];
    }[] = [];

    function processCategory(category: Category, parentId: string | null) {
        result.push({
            id: category.id,
            name: category.name,
            breadcrumb: category.full_name,
            parent_id: parentId,
            attributes: category.attributes,
        });

        // Process child categories recursively
        if (category.children) {
            for (const child of category.children) {
                // Find full child details by matching ID (if needed)
                const childCategory = verticals
                    .flatMap((v) => v.categories)
                    .find((c) => c.id === child.id);
                if (childCategory) processCategory(childCategory, category.id);
            }
        }
    }

    verticals.forEach((vertical) =>
        vertical.categories.forEach((category) =>
            processCategory(category, category.parent_id)
        )
    );

    return result;
}

function mapAttributesToRecord(
    attributes: CategoryAttribute[]
): Record<string, string> {
    return attributes.reduce((acc, attr) => {
        acc[attr.name] = ""; // Set the value to an empty string
        return acc;
    }, {} as Record<string, string>);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
