import { sql } from "slonik";
import { db } from "../db";

export class ClientService {
  constructor() {}

  async getHomePage() {
    try {
      const currentSettings = await db.one(sql.unsafe`
        SELECT * FROM site_settings
      `);

      const categories = await db.many(sql.unsafe`
        SELECT
            c.id, 
            c.parent_id,
            c.rank, 
            c.status, 
            c.name, 
            c.description, 
            c.banner_id, 
            c.metadata_id, 
            c.slug, 
            c.created_at, 
            c.updated_at
        FROM categories c
        ORDER BY c.rank    
      `);

      const latestProducts = await db.many(sql.unsafe`
        SELECT
            p.*,
            JSON_BUILD_OBJECT(
                'id', pi.id,
                'url', pi.url,
                'filename', pi.filename,
                'width', pi.width,
                'height', pi.height
            ) as "primary_image",
            JSON_BUILD_OBJECT(
                'id', si.id,
                'url', si.url,
                'filename', si.filename,
                'width', si.width,
                'height', si.height
            ) as "secondary_image"
        FROM products p
        JOIN images pi ON pi.id = p.primary_image_id
        JOIN images si ON si.id = p.secondary_image_id
        ORDER BY p.created_at DESC
        LIMIT 8
      `);

      if (categories && categories.length > 0) {
        const parentCategories = categories.filter((cat) => !cat.parentId);
        const childCategories = categories.filter((cat) => cat.parentId);

        const all = parentCategories.reduce(
          (acc, cv) => {
            let childrens = childCategories.filter(
              (cc) => cc.parentId === cv.id
            );
            childrens = childrens.map((c) => ({
              id: c.id,
              name: c.name,
              path: `/products?category=${c.id}`,
            }));
            if (childrens && childrens.length > 0) {
              acc.push({
                //@ts-ignore
                id: cv.id,
                name: cv.name as string,
                type: "parent",
                path: `/products?category=${cv.id}`,
                items: childrens,
              });
            } else {
              acc.push({
                //@ts-ignore
                id: cv.id,
                name: cv.name as string,
                type: "single",
                path: `/products?category=${cv.id}`,
              });
            }
            return acc;
          },
          [{ name: "All", type: "single", path: `/products?category=all` }] as {
            name: string;
            type: string;
            path?: string;
            items?: any[];
          }[]
        );

        return {
          categories,
          latestProducts,
          settings: currentSettings,
          sideMenu: all,
        };
      }

      return {
        settings: currentSettings,
        categories,
        latestProducts,
      };
    } catch (error) {
      console.log("Error: ", error);
      throw new Error(`Error getting home page: ${error}`);
    }
  }
}
