import { AdminService } from "./admin-service";
import { AuthService } from "./auth-service";
import { ClientService } from "./client-service";
import { MailService } from "./mail-service";
import { UserService } from "./user-service";

const authService = new AuthService();
const adminService = new AdminService();
const clientService = new ClientService();
const userService = new UserService();
const mailService = new MailService();

export { authService, adminService, clientService, mailService, userService };