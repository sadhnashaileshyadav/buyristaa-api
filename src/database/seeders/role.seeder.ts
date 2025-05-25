import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Role } from 'src/users/entities/role.entity';

export class RoleSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    await dataSource.query('TRUNCATE "role" RESTART IDENTITY;');
    const repository = dataSource.getRepository(Role);
    await repository.insert([
      {
        name: 'admin',
        description: 'Admin',
      },
      {
        name: 'teacher',
        description: 'Teacher',
      },
      {
        name: 'student',
        description: 'Student',
      },
    ]);
  }
}
