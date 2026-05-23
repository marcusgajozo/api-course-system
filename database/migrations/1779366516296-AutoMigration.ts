import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779366516296 implements MigrationInterface {
  name = 'AutoMigration1779366516296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "updated_at" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "cursos" ALTER COLUMN "created_at" TYPE TIMESTAMP`,
    );
  }
}
