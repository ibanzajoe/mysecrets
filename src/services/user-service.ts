import { sql } from "slonik";
import { db } from "../db";

export class UserService {
    constructor() {}

    async getUserById(userId: string) {
        const user = await db.one(sql.unsafe`
            SELECT * FROM users u WHERE u.id = ${userId}    
        `)

        return user;
    }

    async getCartByUserId(userId: string) {
        const cart = await db.one(sql.unsafe`
            SELECT * 
            FROM carts c 
            WHERE c.user_id = ${userId} 
            AND c.cart_status = 'active' 
            ORDER BY c.created_at DESC
            LIMIT 1
        `)

        return cart;
    }
}