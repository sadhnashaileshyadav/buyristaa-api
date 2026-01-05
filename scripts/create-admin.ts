import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/module/users/users.service'; // Corrected path based on previous examples
import { Role } from '../src/core/roles/role.enum'; // Corrected path based on previous examples
import { CreateUserDto } from '../src/module/users/dto/create-user.dto'; // Import the DTO

async function bootstrap() {
  // Use createApplicationContext for a script that runs outside the main HTTP server
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // Get the instance of the UsersService
  const userService = app.get(UsersService);

  // Define the data for the admin user
  // We align these fields with the CreateUserDto structure (username, email, password)
  const name = 'Vishal Signh'; // Added a username field as required by User entity
  const email = 'info@buyristaa.com';
  const password = 'devops!@#123';
  // Note: mobile, name, confirmPassword, and referralCode were not part of our User entity/DTO

  console.log(`Attempting to find existing admin user with email: ${email}`);
  
  // Use the findOne function we defined in users.service.ts
  // The 'username' field in our DB schema is used for authentication check
  const existingAdmin = await userService.findByUsername(email); 

  if (existingAdmin) {
    console.log('Admin user already exists. Exiting script.');
    await app.close();
    return;
  }

  // Prepare the DTO object matching the expected structure
  const adminUserData: CreateUserDto = {
      name: name,
      email: email,
      password: password,
      confirmPassword: password,
      mobile: 7042503066,
      referralCode: '',
      role: Role.ADMIN
  };

  // The 'userService.create' method automatically hashes the password
  // and (in Option 1 logic) automatically assigns the default 'User' role.
  const newUser = await userService.create(adminUserData);

  console.log(`Admin user created successfully with ID: ${newUser.id}!`);

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});