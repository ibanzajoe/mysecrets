import { RegistrationSchema, TLoginSchema, TRegistrationSchema, UserStatus } from "../schema/users.schema";
import { db } from "../db";
import { sql } from "slonik";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { mailService } from "../services";

class AuthService {
  constructor() {
    jwtSecret: process.env.JWT_SECRET
  }

  jwtSecret: string;

  async connect() {
    return db;
  }

  async signToken({ id, email }: { id: string, email: string }) {
    return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), id, email }, this.jwtSecret);
  }

  async verifyToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  async register(data: TRegistrationSchema) {
    try {
      const requestData = RegistrationSchema.parse(data);

      const {
        email,
        password,
        first_name,
        last_name,
      } = requestData;

      const user = (await this.connect())?.one(sql.unsafe`
                SELECT * FROM users WHERE email = ${email}
            `);

      if (user) {
        throw new Error(`User with email already exists: ${email}`);
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = await bcrypt.hash(password, salt);

      (await this.connect()).transaction(async (tx) => {
        const newUser = await tx.query(sql.unsafe`
                    INSERT INTO users (
                        email,
                        password,
                        first_name, 
                        last_name
                    ) VALUES (
                        ${email}, 
                        ${hash}, 
                        ${first_name}, 
                        ${last_name}
                    ) RETURNING *
                `);

        if (newUser) {
          await tx.query(sql.unsafe`
            INSERT INTO carts (user_id) VALUES (${newUser[0].id})    
          `)

          mailService.welcomeEmail(
            newUser[0].email,
            'Welcome to Reflex Clothing',
            `Welcome to Reflex Clothing.  You have completed your registration.  We are currently reviewing your application and will be in touch with you shortly.  You will receive another notification when your account has been approved and activated.  Thank you for your patience and thanks for being a part of Reflex Clothing.`,
            newUser[0].firstName || newUser[0].email,
          );
        }

      });

      return {
        error: false,
      }
    } catch (error) {
      console.log('Registration Error: ', error);
      throw new Error('Registration Error: ', error);
    }
  }

  async validateUser(data: TLoginSchema) {
    const user = await (await this.connect()).maybeOne(sql.unsafe`
            SELECT * FROM users WHERE email = ${data.email}
        `);

    if (!user) {
      return null
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (isMatch) {
      return {
        id: user.id,
        email: user.email
      }
    }

    return null;
  }
}

export { AuthService };